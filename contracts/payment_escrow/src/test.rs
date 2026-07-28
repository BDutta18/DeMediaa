#![cfg(test)]

use soroban_sdk::{Address, Env};

use crate::PaymentEscrow;

#[test]
fn creates_escrow_id() {
    let env = Env::default();
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let asset = Address::generate(&env);

    let payment_id = PaymentEscrow::create_escrow(
        env,
        sender,
        recipient,
        100,
        asset,
        0,
    )
    .unwrap();

    assert_eq!(payment_id, 1);
}
