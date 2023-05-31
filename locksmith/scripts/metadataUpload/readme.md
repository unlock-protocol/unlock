Providing a rough script allowing Lock owners with the ability to upload/update metadata associated with
their Nonfungible Tokens.

Instructions:

1. Install ts-node

Required information:

1. Private Key
2. Lock Address
3. Locksmith Host
4. Location of data to be updated (absolute paths please)
5. Scope ('default' for default anything else for key specific metadata)

The format of the input file should match the examples in `sample_data/defaultKeyMetadata.json` (and must include the `owner` field)

**Update Default Token Metadata**
`ts-node ./scripts/metadataUpload/metadata_upload.ts --privateKey <private key> --lockAddress <lock address> --host https://locksmith.unlock-protocol.com --inputFile <location of metadata json> --scope default`

**Update Token Specific Metadata**
`ts-node ./scripts/metadataUpload/metadata_upload.ts --privateKey <private key> --lockAddress <lock address> --host https://locksmith.unlock-protocol.com --inputFile <location of metadata json> --scope token`

**Update User Specific Metadata**
`ts-node ./scripts/metadataUpload/user_metadata_upload.ts --privateKey <private key> --lockAddress <lock address> --host http://localhost:8080 --inputFile <location of metadata json>`
