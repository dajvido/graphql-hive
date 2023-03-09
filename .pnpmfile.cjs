const { getPackagesSync } = require('@manypkg/get-packages');
const { findRootSync } = require('@manypkg/find-root');

const root = findRootSync(process.cwd());
const workspacePackages = getPackagesSync(root.rootDir);

function readPackage(pkg, context) {
  if (pkg.name.startsWith('@hive/')) {
    const workspaceDependencies = Object.entries({
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    }).filter(([name, version]) => version === 'workspace:*');

    if (workspaceDependencies.length === 0) {
      return pkg;
    }

    context.log(
      `Package "${pkg.name}" depends on ${workspaceDependencies
        .map(v => v[0])
        .join(', ')} from workspace, copying dependencies...`,
    );

    for (const [name] of workspaceDependencies) {
      const workspacePackage = workspacePackages.packages.find(p => p.packageJson.name === name);

      if (workspacePackage) {
        pkg.dependencies = {
          ...(workspacePackage.packageJson.dependencies || {}),
          ...(pkg.dependencies || {}),
        };

        pkg.devDependencies = {
          ...(workspacePackage.packageJson.devDependencies || {}),
          ...(pkg.devDependencies || {}),
        };
      } else {
        context.log(`Package "${name}" not found in workspace`);
      }
    }
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
