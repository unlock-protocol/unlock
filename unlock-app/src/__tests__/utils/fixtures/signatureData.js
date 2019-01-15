const validSignature = {
  address: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
  signature:
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJkYXRhIjoiZGRkIiwiaWF0IjoxNTQ2MjE5NjI3LCJleHAiOjE1NDYyMTk2MzAsImlzcyI6IjB4YWFhZGVlZDRjMGI4NjFjYjM2ZjRjZTAwNmE5YzkwYmEyZTQzZmRjMiJ9.0xd64fd442c30596b2861f60d8e55207aa239df32303689463ea4f5ab48ee9c4992eb6db40d8f8c5b568413f3963edfdb708ed788369c87fc93b1aca95222e54e401',
  data: { data: 'ddd' },
}

const invalidSignature = {
  address: '0xf8aDE52fE03Fceb34458baC79EeBa0bE5344182d',
  signature: 'sqfgewge',
  data: { data: 'ddd' },
}

exports.valid = validSignature
exports.invalid = invalidSignature
