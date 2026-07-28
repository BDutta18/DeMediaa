#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, String};

#[contracterror]
#[derive(Clone, Copy)]
pub enum Error {
    Unauthorized = 1,
    InvalidInput = 2,
    TokenNotFound = 3,
}

#[contract]
pub struct ContentNFT;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    TokenCount,
    Owner(u128),
    Metadata(u128),
}

#[contractimpl]
impl ContentNFT {
    pub fn mint(
        env: Env,
        creator: Address,
        metadata_hash: String,
        royalty_percentage: u32,
    ) -> Result<u128, Error> {
        if metadata_hash.len() == 0 {
            return Err(Error::InvalidInput);
        }

        let mut count: u128 = env
            .storage()
            .instance()
            .get(&DataKey::TokenCount)
            .unwrap_or(0);
        count += 1;
        let token_id = count;

        env.storage()
            .instance()
            .set(&DataKey::Owner(token_id), &creator);
        env.storage()
            .instance()
            .set(&DataKey::Metadata(token_id), &(metadata_hash, royalty_percentage));
        env.storage().instance().set(&DataKey::TokenCount, &count);

        Ok(token_id)
    }

    pub fn transfer(env: Env, from: Address, to: Address, token_id: u128) -> Result<(), Error> {
        let current_owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner(token_id))
            .ok_or(Error::TokenNotFound)?;

        if current_owner != from {
            return Err(Error::Unauthorized);
        }

        env.storage().instance().set(&DataKey::Owner(token_id), &to);
        Ok(())
    }

    pub fn get_owner(env: Env, token_id: u128) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Owner(token_id))
            .ok_or(Error::TokenNotFound)
    }

    pub fn get_metadata(env: Env, token_id: u128) -> Option<(String, u32)> {
        env.storage().instance().get(&DataKey::Metadata(token_id))
    }

    pub fn total_supply(env: Env) -> u128 {
        env.storage()
            .instance()
            .get(&DataKey::TokenCount)
            .unwrap_or(0)
    }
}
