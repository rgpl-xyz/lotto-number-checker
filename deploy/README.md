# Deploying lotto.app.rgpl.xyz

The site is the production build (`ng build`, `liveResults` off) served as static files by nginx on the rgpl VPS (`ssh rgpl`). CI runs the tests and the build, then the e2e tests against the build under `nginx/lotto.conf`. Deploys are run by hand.

| Path on the VPS | What it is |
|---|---|
| `/etc/nginx/sites-available/lotto` | copy of `deploy/nginx/lotto.conf`, plus the TLS lines certbot adds |
| `/var/www/lotto/releases/<commit>/` | one build per deployed commit (newest three kept) |
| `/var/www/lotto/current` | symlink to the live release; nginx's `root` |
| `/var/www/lotto/previous` | symlink to the release before it; nginx serves files missing from `current` from here, so tabs opened before a deploy can still load their hashed bundles |
| `/var/www/lotto/deploy-history` | one line per deploy: UTC time and commit |
| `/var/www/lotto/` | owned by the `deploy` account, which deploys log in as; it can write here and nowhere else |

## One-time setup

1. DNS (Namecheap): an `A` record, host `lotto.app`, value `45.249.91.118`. There is no wildcard record.
2. Install the site and check the config:

   ```bash
   scp deploy/nginx/lotto.conf rgpl:/etc/nginx/sites-available/lotto
   ssh rgpl 'ln -s /etc/nginx/sites-available/lotto /etc/nginx/sites-enabled/lotto && nginx -t && systemctl reload nginx'
   ```

3. A deploy account, so deploys don't log in as root. It owns `/var/www/lotto` and nothing else, and takes one SSH key, without a terminal or forwarding. The account and key are shared with the other side project on the VPS, so skip what exists:

   ```bash
   ssh rgpl 'id deploy >/dev/null 2>&1 || useradd --create-home --shell /bin/bash --user-group deploy; install -d -o deploy -g deploy /var/www/lotto'
   ssh-keygen -t ed25519 -N "" -C "deploys to rgpl" -f ~/.ssh/rgpl-deploy
   { printf 'restrict '; cat ~/.ssh/rgpl-deploy.pub; } | ssh rgpl 'install -d -m 700 -o deploy -g deploy /home/deploy/.ssh && cat >> /home/deploy/.ssh/authorized_keys && chown deploy:deploy /home/deploy/.ssh/authorized_keys && chmod 600 /home/deploy/.ssh/authorized_keys'
   ```

   Then add an alias to `~/.ssh/config` on the machine that deploys:

   ```
   Host rgpl-deploy
       HostName 45.249.91.118
       User deploy
       IdentityFile ~/.ssh/rgpl-deploy
       IdentitiesOnly yes
   ```

4. First deploy (below), so `/var/www/lotto/current` exists.
5. TLS, once DNS resolves to the VPS:

   ```bash
   ssh rgpl 'certbot --nginx -d lotto.app.rgpl.xyz --non-interactive --agree-tos --redirect'
   ```

## Deploy

From the repo root, with Node on `PATH` (the version in `.nvmrc`):

```bash
deploy/deploy.sh            # builds and publishes origin/main
deploy/deploy.sh <commit>   # any commit already on origin/main
```

The script refuses commits that are not on `origin/main` and builds from a clean `git archive` (no local changes or `node_modules`). A release is unpacked outside `releases/`, moved in with one rename and never changed afterwards. A commit whose release is already on the server is switched to without rebuilding, so redeploying an earlier commit is a quick rollback. The `current` symlink also switches in one rename, so visitors never see a half-copied release.

## Roll back

Deploy the earlier commit. Its release is still on the server, so the script switches to it without rebuilding:

```bash
ssh rgpl-deploy 'ls -1t /var/www/lotto/releases; tail -3 /var/www/lotto/deploy-history'
deploy/deploy.sh <commit>
```

Or point `current` at a release by hand:

```bash
ssh rgpl-deploy 'cd /var/www/lotto && ln -sfn releases/<commit> current.next && mv -Tf current.next current'
```

## Check a deploy

```bash
curl -sI https://lotto.app.rgpl.xyz/ | grep -iE '^(HTTP|content-security-policy|strict-transport-security|cache-control)'
curl -so /dev/null -w '%{http_code}\n' https://lotto.app.rgpl.xyz/missing           # 404
curl -so /dev/null -w '%{http_code} %{redirect_url}\n' http://lotto.app.rgpl.xyz/   # 301 to https
E2E_BASE_URL=https://lotto.app.rgpl.xyz npm run e2e                                 # the e2e tests, against the live site
```
