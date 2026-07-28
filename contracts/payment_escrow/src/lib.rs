#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, vec, Address, Env, IntoVal, Symbol, Val,
};

#[contracterror]
#[derive(Clone, Copy)]
pub enum Error {
    InvalidInput = 1,
    NotFound = 2,
}

#[contract]
pub struct PaymentEscrow;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Escrow(u64),
    NextId,
}

#[contractimpl]
impl PaymentEscrow {
    pub fn create_escrow(
        env: Env,
        sender: Address,
        recipient: Address,
        amount: i128,
        asset: Address,
        hold_duration: u64,
    ) -> Result<u64, Error> {
        if amount <= 0 {
            return Err(Error::InvalidInput);
        }

        let mut next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);
        let payment_id = next_id;
        next_id += 1;

        let timestamp = env.ledger().timestamp();
        let escrow_data = (
            sender,
            recipient,
            amount,
            asset,
            0u32,
            timestamp + hold_duration,
        );

        env.storage()
            .instance()
            .set(&DataKey::Escrow(payment_id), &escrow_data);
        env.storage().instance().set(&DataKey::NextId, &next_id);
        Ok(payment_id)
    }

    pub fn get_escrow(
        env: Env,
        payment_id: u64,
    ) -> Option<(Address, Address, i128, Address, u32, u64)> {
        env.storage().instance().get(&DataKey::Escrow(payment_id))
    }

    pub fn instant_settle(
        env: Env,
        sender: Address,
        recipient: Address,
        amount: i128,
        asset: Address,
    ) -> Result<u64, Error> {
        Self::create_escrow(env, sender, recipient, amount, asset, 0)
    }

    pub fn instant_settle_with_royalty(
        env: Env,
        sender: Address,
        recipient: Address,
        amount: i128,
        asset: Address,
        royalty_contract: Address,
        token_id: u128,
    ) -> Result<(u64, i128), Error> {
        let payment_id = Self::create_escrow(
            env.clone(),
            sender,
            recipient,
            amount,
            asset,
            0,
        )?;

        let royalty_args: soroban_sdk::Vec<Val> = vec![
            &env,
            token_id.into_val(&env),
            amount.into_val(&env)
        ];

        let royalty_amount: i128 = env.invoke_contract(
            &royalty_contract,
            &Symbol::new(&env, "distribute_royalty"),
            royalty_args,
        );

        Ok((payment_id, royalty_amount))
    }
}

#[cfg(test)]
mod test;
