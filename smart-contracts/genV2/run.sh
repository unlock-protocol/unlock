#!/bin/bash

TEMPLATE=genV2/UnlockDiscountTokenV2.template.sol
PATCH=genV2/UnlockDiscountTokenV2.patch
TARGET=contracts/UnlockDiscountTokenV2.generated.sol


npx hardhat flatten $TEMPLATE > $TARGET

# needed because hardhat flatten doesn't remove duplicated Licences
sed -i '/SPDX-License-Identifier/d' $TARGET

# patch solidity
patch $TARGET $PATCH
