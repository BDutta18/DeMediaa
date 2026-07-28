#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env};

#[contracterror]
#[derive(Clone, Copy)]
pub enum Error {
    Unauthorized = 1,
    RoleAlreadyAssigned = 2,
    RoleNotAssigned = 3,
    NotInitialized = 4,
    AlreadyInitialized = 5,
}

#[contract]
pub struct AccessControl;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    Role(Address),
}

#[contractimpl]
impl AccessControl {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::Role(admin), &(Role::Admin as u32));
        Ok(())
    }

    fn admin(env: &Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)
    }

    fn require_admin(env: &Env, caller: &Address) -> Result<(), Error> {
        let admin = Self::admin(env)?;
        if *caller != admin {
            return Err(Error::Unauthorized);
        }
        Ok(())
    }

    pub fn has_role(env: Env, address: Address, role: u32) -> bool {
        env.storage()
            .instance()
            .get(&DataKey::Role(address))
            .unwrap_or(255)
            == role
    }

    pub fn assign_role(env: Env, admin: Address, address: Address, role: u32) -> Result<(), Error> {
        Self::require_admin(&env, &admin)?;

        let current_role = env
            .storage()
            .instance()
            .get(&DataKey::Role(address.clone()))
            .unwrap_or(255);
        if current_role == role {
            return Err(Error::RoleAlreadyAssigned);
        }

        env.storage()
            .instance()
            .set(&DataKey::Role(address), &role);
        Ok(())
    }

    pub fn revoke_role(env: Env, admin: Address, address: Address, role: u32) -> Result<(), Error> {
        Self::require_admin(&env, &admin)?;

        let current_role = env
            .storage()
            .instance()
            .get(&DataKey::Role(address.clone()))
            .unwrap_or(255);
        if current_role != role {
            return Err(Error::RoleNotAssigned);
        }

        env.storage().instance().remove(&DataKey::Role(address));
        Ok(())
    }

    pub fn get_user_role(env: Env, address: Address) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Role(address))
            .unwrap_or(255)
    }

    pub fn is_admin(env: Env, address: Address) -> bool {
        Self::has_role(env, address, Role::Admin as u32)
    }

    pub fn is_creator(env: Env, address: Address) -> bool {
        Self::has_role(env, address, Role::Creator as u32)
    }

    pub fn is_consumer(env: Env, address: Address) -> bool {
        Self::has_role(env, address, Role::Consumer as u32)
    }
}

#[allow(dead_code)]
enum Role {
    Admin = 0,
    Creator = 1,
    Consumer = 2,
    Moderator = 3,
}
