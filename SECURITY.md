# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in DeMedia, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

### Steps

1. Email the maintainer at **bodhisatwadutta025@gmail.com** with:

   - A clear description of the vulnerability
   - Steps to reproduce or a proof of concept
   - The potential impact and affected components

2. You will receive an acknowledgement within **48 hours**.

3. We aim to release a fix or mitigation within **7 days** of a confirmed report.

4. Once resolved, we will credit you (if desired) in the release notes.

## Security Best Practices for Contributors

- Never commit secrets, private keys, or JWT tokens
- All wallet interactions require signature verification
- JWT tokens must be signed with JWT_SECRET (minimum 32 chars in production)
- Stellar private keys must never be stored client-side
- All user inputs are validated server-side before processing

## Scope

In scope for reports:

- Authentication bypass or JWT forgery
- Privilege escalation on protected API routes
- XSS vulnerabilities in frontend components
- IPFS/Pinata credential exposure
- Stellar transaction manipulation

Out of scope:

- Denial of Service attacks on public endpoints
- Social engineering attacks
- Theoretical vulnerabilities without a working proof of concept
