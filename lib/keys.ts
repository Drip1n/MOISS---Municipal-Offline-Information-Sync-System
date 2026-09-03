/**
 * DEMO SIGNING KEYS — prototype only.
 *
 * In a real deployment the Municipal Command private key would live only on the
 * command hardware (or an HSM), and each NCP would be provisioned with the public
 * key out-of-band. For this hackathon prototype we ship a fixed keypair so the
 * signature workflow is demonstrable end-to-end without a provisioning step.
 */

// 32-byte Ed25519 seed (hex). Municipal Command "private" key.
export const COMMAND_PRIVATE_KEY_HEX =
  "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60";

// Corresponding public key (hex) — embedded in the NCP for verification.
export const COMMAND_PUBLIC_KEY_HEX =
  "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
