# doctors-without-borders

Uses express for the http server built using [express-generator](http://expressjs.com/starter/generator.html) with the
following command:

```sh
express --hbs --css=less --force directory
```

## ui pipeline

The clientside uses riot.js, RiotControl and riotify to build up the
components that make up the UI. It's all bundled via browserify with
the `make js` command.
