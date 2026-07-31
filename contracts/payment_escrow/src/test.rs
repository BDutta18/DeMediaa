#![cfg(test)]

use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env};

use crate::{PaymentEscrow, PaymentEscrowClient};

#[test]
fn creates_escrow_id() {
    let env = Env::default();
    let contract_id = env.register_contract(None, PaymentEscrow);
    let client = PaymentEscrowClient::new(&env, &contract_id);
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);

    let payment_id = client.create_escrow(&sender, &recipient, &100, &asset, &0);

    assert_eq!(payment_id, 1);
}
