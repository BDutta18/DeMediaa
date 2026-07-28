#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env};

#[contracterror]
#[derive(Clone, Copy)]
pub enum Error {
    InvalidInput = 1,
    NotFound = 2,
}

#[contract]
pub struct RoyaltyManager;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Royalty(u128),
    Pending(Address),
}

#[contractimpl]
impl RoyaltyManager {
    pub fn set_royalty(
        env: Env,
        token_id: u128,
        creator: Address,
        royalty_percentage: u32,
    ) -> Result<(), Error> {
        if royalty_percentage > 10000 {
            return Err(Error::InvalidInput);
        }

        env.storage().instance().set(
            &DataKey::Royalty(token_id),
            &(creator, royalty_percentage),
        );
        Ok(())
    }

    pub fn calculate_royalty(amount: i128, royalty_percentage: u32) -> i128 {
        (amount * (royalty_percentage as i128)) / 10000
    }

    pub fn distribute_royalty(env: Env, token_id: u128, sale_amount: i128) -> Result<i128, Error> {
        let (creator, royalty_percentage): (Address, u32) = env
            .storage()
            .instance()
            .get(&DataKey::Royalty(token_id))
            .ok_or(Error::NotFound)?;
        let royalty_amount = Self::calculate_royalty(sale_amount, royalty_percentage);

        let current_pending: Option<i128> = env
            .storage()
            .instance()
            .get(&DataKey::Pending(creator.clone()));
        env.storage()
            .instance()
            .set(
                &DataKey::Pending(creator),
                &(current_pending.unwrap_or(0) + royalty_amount),
            );
        Ok(royalty_amount)
    }

    pub fn claim_royalty(env: Env, creator: Address) -> Result<i128, Error> {
        let total_claimable: Option<i128> = env
            .storage()
            .instance()
            .get(&DataKey::Pending(creator.clone()));
        let total_claimable = total_claimable.unwrap_or(0);
        if total_claimable == 0 {
            return Err(Error::NotFound);
        }
        env.storage()
            .instance()
            .set(&DataKey::Pending(creator), &0i128);
        Ok(total_claimable)
    }

    pub fn get_pending_royalties(env: Env, creator: Address) -> i128 {
        let pending: Option<i128> = env
            .storage()
            .instance()
            .get(&DataKey::Pending(creator));
        pending.unwrap_or(0)
    }
}
