#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env};

#[contracterror]
#[derive(Clone, Copy)]
pub enum Error {
    NotFound = 1,
}

#[contract]
pub struct SubscriptionManager;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Subscription(u64),
    NextSubId,
    Access(AccessKey),
}

#[contracttype]
#[derive(Clone)]
struct AccessKey {
    subscriber: Address,
    content_id: u128,
}

#[contractimpl]
impl SubscriptionManager {
    pub fn subscribe(
        env: Env,
        subscriber: Address,
        tier: u32,
        duration_seconds: u64,
    ) -> Result<u64, Error> {
        let mut next_id: u64 = env.storage().instance().get(&DataKey::NextSubId).unwrap_or(1);
        let sub_id = next_id;
        next_id += 1;

        let timestamp = env.ledger().timestamp();
        let end_time = timestamp + duration_seconds;

        let sub_data = (subscriber, tier, timestamp, end_time);

        env.storage()
            .instance()
            .set(&DataKey::Subscription(sub_id), &sub_data);
        env.storage().instance().set(&DataKey::NextSubId, &next_id);
        Ok(sub_id)
    }

    pub fn grant_content_access(
        env: Env,
        subscriber: Address,
        content_id: u128,
    ) -> Result<(), Error> {
        env.storage().instance().set(
            &DataKey::Access(AccessKey {
                subscriber,
                content_id,
            }),
            &true,
        );
        Ok(())
    }

    pub fn validate_access(env: Env, subscriber: Address, content_id: u128) -> bool {
        let access: Option<bool> = env
            .storage()
            .instance()
            .get(&DataKey::Access(AccessKey {
                subscriber,
                content_id,
            }));
        access.unwrap_or(false)
    }

    pub fn get_subscription(env: Env, sub_id: u64) -> Option<(Address, u32, u64, u64)> {
        env.storage().instance().get(&DataKey::Subscription(sub_id))
    }
}
