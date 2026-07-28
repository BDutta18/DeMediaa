#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol};

#[contract]
pub struct ContentRegistry;

#[contractimpl]
impl ContentRegistry {
    pub fn register_content(env: Env, creator: Address, content_hash: String) -> String {
        env.events().publish(
            (Symbol::new(&env, "content_registered"), creator),
            content_hash.clone(),
        );
        content_hash
    }
}
