# Security policy

Please do not report vulnerabilities, exposed credentials, or private user data in a public issue. Contact the maintainers privately with the affected area, reproduction steps, and impact.

Never commit `.env`, `.env.local`, API keys, database URLs, session secrets, or production data. If a secret is exposed, revoke/rotate it immediately and notify the maintainers. Removing a file from the latest commit does not remove it from Git history; history cleanup should be coordinated separately.
