import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const SplineScene = () => {
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Spline Scene</title>
              <script type="module" src="https://unpkg.com/@splinetool/viewer@0.9.395/build/spline-viewer.js"></script>
              <style>
                body { margin: 0; overflow: hidden; }
                spline-viewer { width: 100vw; height: 100vh; display: block; }
              </style>
          </head>
          <body>
              <spline-viewer url="https://prod.spline.design/FlFIUB3hg2NwCCFt/scene.splinecode"></spline-viewer>
          </body>
          </html>
        ` }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default SplineScene;
