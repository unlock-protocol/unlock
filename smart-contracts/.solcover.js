module.exports = {
    skipFiles: [
        'past-versions',
        'mocks',
        'test-artifacts',
        'UnlockUtils',
        // ignore UDT as too many gas-dependant tests
        'UnlockDiscountToken',
    ]
};
