// temporary helper to start expo CLI with sanitized env
delete process.env.EXPO_DEBUG;
delete process.env.EXPO_NO_PROMPT;
process.argv = ['node','expo','start','--tunnel','-c','--port','8082'];
require('../node_modules/@expo/cli/build/bin/cli');
