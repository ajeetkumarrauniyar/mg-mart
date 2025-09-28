#!/usr/bin/env tsx

/**
 * Quick Controller Test Runner
 * Run specific controller tests from command line
 */

import { spawn } from "child_process";
import { readFileSync } from "fs";
import path from "path";

const COMMANDS = {
  "test-controllers": "tsx src/test-controllers.ts",
  "validate-controllers": "tsx src/validate-controllers.ts",
  "test-repos": "tsx src/test-repositories.ts",
  "test-endpoints": "tsx src/test-endpoints.ts",
};

function printUsage() {
  console.log("🧪 MG Mart Controller Test Runner");
  console.log("================================\n");
  console.log("Usage: tsx run-controller-tests.ts [command]\n");
  console.log("Available commands:");
  console.log(
    "  test-controllers     - Start interactive test server (recommended)"
  );
  console.log(
    "  validate-controllers - Validate all controllers load correctly"
  );
  console.log("  test-repos          - Test repository layer");
  console.log("  test-endpoints      - Test basic endpoints");
  console.log("  all                 - Run all tests sequentially");
  console.log("  help                - Show this help message\n");
  console.log("Examples:");
  console.log("  tsx run-controller-tests.ts test-controllers");
  console.log("  tsx run-controller-tests.ts validate-controllers");
  console.log("  tsx run-controller-tests.ts all");
}

function runCommand(command: string, description: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 ${description}`);
    console.log("=".repeat(50));

    const [cmd, ...args] = command.split(" ");
    const child = spawn(cmd!, args, {
      stdio: "inherit",
      shell: true,
      cwd: process.cwd(),
    });

    child.on("close", (code: number | null) => {
      if (code === 0) {
        console.log(`\n✅ ${description} - Completed successfully`);
        resolve();
      } else {
        console.log(`\n❌ ${description} - Failed with exit code ${code}`);
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on("error", (error: Error) => {
      console.log(`\n💥 ${description} - Error: ${error.message}`);
      reject(error);
    });
  });
}

async function runAllTests() {
  const tests = [
    { cmd: COMMANDS["validate-controllers"], desc: "Validating Controllers" },
    { cmd: COMMANDS["test-repos"], desc: "Testing Repositories" },
    { cmd: COMMANDS["test-endpoints"], desc: "Testing Basic Endpoints" },
  ];

  console.log("🧪 Running All Tests");
  console.log("=".repeat(50));

  for (const test of tests) {
    try {
      await runCommand(test.cmd, test.desc);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between tests
    } catch (error) {
      console.log(
        `\n⚠️  Test "${test.desc}" failed, continuing with next test...`
      );
    }
  }

  console.log("\n🎉 All tests completed!");
  console.log("\n💡 To start the interactive test server, run:");
  console.log("   tsx run-controller-tests.ts test-controllers");
}

async function main() {
  const command = process.argv[2];

  if (!command || command === "help") {
    printUsage();
    return;
  }

  if (command === "all") {
    await runAllTests();
    return;
  }

  if (!COMMANDS[command as keyof typeof COMMANDS]) {
    console.log(`❌ Unknown command: ${command}\n`);
    printUsage();
    process.exit(1);
  }

  const selectedCommand = COMMANDS[command as keyof typeof COMMANDS];
  const descriptions = {
    "test-controllers": "Starting Interactive Controller Test Server",
    "validate-controllers": "Validating All Controllers",
    "test-repos": "Testing Repository Layer",
    "test-endpoints": "Testing Basic Endpoints",
  };

  try {
    await runCommand(
      selectedCommand,
      descriptions[command as keyof typeof descriptions]
    );
  } catch (error) {
    console.log("\n💥 Test execution failed");
    process.exit(1);
  }
}

main().catch(console.error);
