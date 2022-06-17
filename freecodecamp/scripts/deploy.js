async function main() {
  /**
   * Asynchronous functions return a Promise,
   * which can have one of three states:
   * - Pending
   * - Fulfilled
   * - Rejected
   * `await` keyword in front of an async function
   * waits for Promise to be fulfilled or rejected
   */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
