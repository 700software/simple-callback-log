[simple-callback-log](https://simple-callback-log.vercel.app/)
=====================

Example local test with `curl`

    curl -d '{"test": true}' --header 'content-type:application/json'  http://localhost:3000/api/callback

Or, more practically, host it in Vercel easily to create an HTTPS endpoint to receive webhook tests.


New database setup
------------------

```sql
create database simple;
use simple
```

### create database user ###

```sh
mysql -e 'create database if not exists simple'
mysql -e 'drop user if exists simple'
X=`openssl rand -base64 9` # creates a random secret
mysql -e "grant all on simple.* to simple identified by '$X'"
echo Add this password to your .env.local file: $X
```

### secret locally ###

Create `.env.local` like so:

```ini
MYSQL_HOST=db.700s.net
MYSQL_PASS=••••••••••••
```

### secret in production ###

Set `MYSQL_HOST=db.700s.net` and `MYSQL_PASS=••••••••••••` environment variables in our Vercel hosting.
