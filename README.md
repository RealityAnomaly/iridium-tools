# Iridium Tools

<p align="center">
  <img src="https://img.shields.io/jsr/v/@perdition/iridium" />
</p>

This is a Deno library that lets you control an Iridium GO device with its SOAP API.

## Example
```ts
import { IridiumGo } from "@perdition/iridium";

const radio = await IridiumGo.create({
  username: 'admin',
  password: 'foobar'
});

await radio.setInternet(true);
console.log(await radio.getStatus());
```
