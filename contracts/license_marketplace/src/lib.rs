#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, vec, Address, Env, String, Symbol, Val,
};

#[contracterror]
#[derive(Clone, Copy)]
pub enum Error {
    InvalidInput = 1,
    NotFound = 2,
    Unauthorized = 3,
    AlreadyLicensed = 4,
    InsufficientPayment = 5,
    ListingNotActive = 6,
    CreatorCannotLicense = 7,
}

#[contract]
pub struct LicenseMarketplace;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Listing(u128),
    License(u128, Address),
    Royalty(u128),
    NextListingId,
    TotalRevenue,
}

#[contracttype]
#[derive(Clone)]
struct Listing {
    creator: Address,
    content_hash: String,
    license_price: i128,
    royalty_bps: u32,
    active: bool,
    created_at: u64,
}

#[contracttype]
#[derive(Clone)]
struct License {
    buyer: Address,
    listing_id: u128,
    license_type: u32,
    purchased_at: u64,
    amount_paid: i128,
}

#[contractimpl]
impl LicenseMarketplace {
    /// Create a new license listing for content
    pub fn create_listing(
        env: Env,
        creator: Address,
        content_hash: String,
        license_price: i128,
        royalty_bps: u32,
    ) -> Result<u128, Error> {
        if license_price <= 0 || royalty_bps > 10000 || content_hash.len() == 0 {
            return Err(Error::InvalidInput);
        }

        creator.require_auth();

        let mut next_id: u128 = env
            .storage()
            .instance()
            .get(&DataKey::NextListingId)
            .unwrap_or(1);
        let listing_id = next_id;
        next_id += 1;

        let listing = Listing {
            creator: creator.clone(),
            content_hash: content_hash.clone(),
            license_price,
            royalty_bps,
            active: true,
            created_at: env.ledger().timestamp(),
        };

        env.storage()
            .instance()
            .set(&DataKey::Listing(listing_id), &listing);
        env.storage()
            .instance()
            .set(&DataKey::NextListingId, &next_id);

        env.events().publish(
            (Symbol::new(&env, "listing_created"), creator),
            (listing_id, content_hash, license_price, royalty_bps),
        );

        Ok(listing_id)
    }

    /// Purchase a license for listed content
    pub fn purchase_license(
        env: Env,
        buyer: Address,
        listing_id: u128,
        license_type: u32,
    ) -> Result<i128, Error> {
        buyer.require_auth();

        let listing: Listing = env
            .storage()
            .instance()
            .get(&DataKey::Listing(listing_id))
            .ok_or(Error::NotFound)?;

        if !listing.active {
            return Err(Error::ListingNotActive);
        }

        if buyer == listing.creator {
            return Err(Error::CreatorCannotLicense);
        }

        if env
            .storage()
            .instance()
            .has(&DataKey::License(listing_id, buyer.clone()))
        {
            return Err(Error::AlreadyLicensed);
        }

        let amount = listing.license_price;

        let royalty_amount = Self::calculate_royalty(amount, listing.royalty_bps);

        let license = License {
            buyer: buyer.clone(),
            listing_id,
            license_type,
            purchased_at: env.ledger().timestamp(),
            amount_paid: amount,
        };

        env.storage()
            .instance()
            .set(&DataKey::License(listing_id, buyer.clone()), &license);

        let total_revenue: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalRevenue)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalRevenue, &(total_revenue + amount));

        env.events().publish(
            (Symbol::new(&env, "license_purchased"), buyer),
            (listing_id, license_type, amount, royalty_amount),
        );

        Ok(amount)
    }

    /// Get a specific listing
    pub fn get_listing(
        env: Env,
        listing_id: u128,
    ) -> Option<(Address, String, i128, u32, bool, u64)> {
        let listing: Listing = env
            .storage()
            .instance()
            .get(&DataKey::Listing(listing_id))?;
        Some((
            listing.creator,
            listing.content_hash,
            listing.license_price,
            listing.royalty_bps,
            listing.active,
            listing.created_at,
        ))
    }

    /// Check if a buyer has a valid license
    pub fn has_license(env: Env, listing_id: u128, buyer: Address) -> bool {
        env.storage()
            .instance()
            .has(&DataKey::License(listing_id, buyer))
    }

    /// Get license details
    pub fn get_license(
        env: Env,
        listing_id: u128,
        buyer: Address,
    ) -> Option<(Address, u128, u32, u64, i128)> {
        let license: License = env
            .storage()
            .instance()
            .get(&DataKey::License(listing_id, buyer))?;
        Some((
            license.buyer,
            license.listing_id,
            license.license_type,
            license.purchased_at,
            license.amount_paid,
        ))
    }

    /// Deactivate a listing (creator only)
    pub fn deactivate_listing(env: Env, creator: Address, listing_id: u128) -> Result<(), Error> {
        creator.require_auth();

        let mut listing: Listing = env
            .storage()
            .instance()
            .get(&DataKey::Listing(listing_id))
            .ok_or(Error::NotFound)?;

        if listing.creator != creator {
            return Err(Error::Unauthorized);
        }

        listing.active = false;
        env.storage()
            .instance()
            .set(&DataKey::Listing(listing_id), &listing);

        env.events().publish(
            (Symbol::new(&env, "listing_deactivated"), creator),
            listing_id,
        );

        Ok(())
    }

    /// Calculate royalty amount (basis points)
    pub fn calculate_royalty(amount: i128, royalty_bps: u32) -> i128 {
        (amount * (royalty_bps as i128)) / 10000
    }

    /// Get total platform revenue
    pub fn get_total_revenue(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalRevenue)
            .unwrap_or(0)
    }
}
