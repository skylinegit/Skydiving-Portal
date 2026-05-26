"""Password hashing and verification.

Uses passlib's CryptContext with both bcrypt (new) and phpass (WordPress
legacy) schemes. This lets the WordPress-imported users continue to log in
with their existing hashes, and silently re-hashes them to bcrypt on next
successful login.

On every successful verification, the caller should:
    if needs_rehash(hashed):
        new_hash = hash_password(plain)
        # persist new_hash + set users.hash_algorithm = 'bcrypt'
"""

from passlib.context import CryptContext

# `phpass` is the WordPress hash format. `bcrypt` is the modern default.
# Marking phpass as deprecated tells passlib to flag it for re-hashing
# whenever a phpass hash verifies successfully.
_pwd_context = CryptContext(
    schemes=["bcrypt", "phpass"],
    default="bcrypt",
    deprecated=["phpass"],
    bcrypt__rounds=12,
)


def hash_password(plain: str) -> str:
    """Hash a plaintext password with the default scheme (bcrypt)."""
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if `plain` matches the stored hash, otherwise False.

    Works for both bcrypt and phpass hashes — passlib auto-detects the
    scheme from the hash prefix.
    """
    try:
        return _pwd_context.verify(plain, hashed)
    except Exception:
        # Malformed hash, etc. — never raise from a verify call.
        return False


def needs_rehash(hashed: str) -> bool:
    """Return True if the stored hash uses a deprecated scheme (phpass).

    Used to trigger an invisible upgrade to bcrypt on successful login.
    """
    return _pwd_context.needs_update(hashed)


def identify_algorithm(hashed: str) -> str:
    """Return 'bcrypt' or 'phpass' (or 'unknown') based on the hash prefix.

    The DB column `users.hash_algorithm` is updated alongside re-hashes.
    """
    try:
        scheme = _pwd_context.identify(hashed)
        return scheme or "unknown"
    except Exception:
        return "unknown"
