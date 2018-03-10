/**
 * Name: index.ts
 * Description: Main entry point file
 * Author: Ovidiu Barabula <lectii2008@gmail.com>
 * @since 0.1.0
 */

interface IGreeting {
  hello(name: string): string;
}

const GreetingFactory = function (greeting: string): IGreeting {
  if (!greeting || typeof greeting !== 'string') {
    throw new Error(`GreetingFactory requires 1 parameter to be a string, ${typeof greeting} was passed instead`);
  }

  return Object.freeze({
    hello(name: string): string {
      return `${greeting}, ${name}!`;
    },
  });
};

export default GreetingFactory;
