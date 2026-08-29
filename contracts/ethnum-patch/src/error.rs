//! Module with hacks for creating error variants for standard library errors
//! without public interfaces.

use core::num::{IntErrorKind, ParseIntError, TryFromIntError};

/// Returns a `ParseIntError` from an `IntErrorKind`.
pub fn pie(kind: IntErrorKind) -> ParseIntError {
    match kind {
        IntErrorKind::Empty => "".parse::<u8>().unwrap_err(),
        IntErrorKind::InvalidDigit => "?".parse::<u8>().unwrap_err(),
        IntErrorKind::PosOverflow => "999".parse::<u8>().unwrap_err(),
        IntErrorKind::NegOverflow => "-1".parse::<u8>().unwrap_err(),
        IntErrorKind::Zero => "0".parse::<core::num::NonZeroU8>().unwrap_err(),
        _ => "".parse::<u8>().unwrap_err(),
    }
}

/// Returns a `TryFromIntError`.
pub fn tfie() -> TryFromIntError {
    u8::try_from(-1i8).unwrap_err()
}

#[cfg(test)]
mod tests {
    use super::*;
    use core::num::NonZeroU32;

    #[test]
    #[allow(clippy::from_str_radix_10)]
    fn parse_int_error() {
        assert_eq!(
            pie(IntErrorKind::Empty),
            u8::from_str_radix("", 2).unwrap_err(),
        );
        assert_eq!(
            pie(IntErrorKind::InvalidDigit),
            u8::from_str_radix("?", 2).unwrap_err(),
        );
        assert_eq!(
            pie(IntErrorKind::PosOverflow),
            u8::from_str_radix("zzz", 36).unwrap_err(),
        );
        assert_eq!(
            pie(IntErrorKind::NegOverflow),
            i8::from_str_radix("-1337", 10).unwrap_err(),
        );
        assert_eq!(
            pie(IntErrorKind::Zero),
            "0".parse::<NonZeroU32>().unwrap_err(),
        );
    }

    #[test]
    fn try_from_int_error() {
        assert_eq!(tfie(), u8::try_from(-1).unwrap_err());
    }
}
