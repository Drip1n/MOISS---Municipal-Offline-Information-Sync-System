/**
 * MUNICIPALITY SIGNING KEYS — prototype values.
 *
 * Trust model: NCPs are provisioned with the municipality public key BEFORE a
 * crisis (out-of-band, at install time). The public key therefore never travels
 * in the transport payload — every device already holds it. This is not a PKI;
 * it is one pre-shared key.
 *
 * In a real deployment the private key lives only on Command hardware / an HSM.
 * For the hackathon we ship a fixed keypair so the flow is demonstrable.
 */

// 32-byte Ed25519 seed (hex) — Municipal Command private key.
export const COMMAND_PRIVATE_KEY_HEX =
  "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60";

// Corresponding public key (hex) — pre-provisioned on every NCP and courier device.
export const COMMAND_PUBLIC_KEY_HEX =
  "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
