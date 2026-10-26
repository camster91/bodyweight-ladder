import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';
if (Capacitor.isNativePlatform()) {
  window.LadderNative = {
    async exportJson(text, name) {
      const file = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
      // Keep the temporary file available while the receiving app copies it.
      await Share.share({ title: 'Save your Bodyweight Ladder backup', files: [file.uri], dialogTitle: 'Save backup' });
    }
  };
  App.addListener('appStateChange', ({isActive}) => {
    if (!isActive) window.dispatchEvent(new Event('ladder-native-background'));
  });
}
