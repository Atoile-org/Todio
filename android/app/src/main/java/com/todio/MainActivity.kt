package com.todio

import android.database.Cursor
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.util.Log
import androidx.activity.result.contract.ActivityResultContracts
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import java.io.File
import java.io.FileOutputStream
import com.rmsl.juce.Java

class MainActivity : ReactActivity() {

  companion object {
    private const val TAG = "JuceBridge"
  }

  private val pickAudioFile =
      registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri != null) {
          copyToCacheAndPlay(uri)
        } else {
          Log.w(TAG, "No file selected")
        }
      }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "todio"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)

    Java.initialiseJUCE(applicationContext)

    JuceBridge.audioInit()
  }

  /**
   * JUCE's AudioFormatManager reads from a real filesystem path (juce::File),
   * not a content:// URI, and it picks a format reader based on file
   * extension - so we copy the picked file into our cache dir, preserving
   * its original name/extension, before handing the path to JUCE.
   */
  private fun copyToCacheAndPlay(uri: Uri) {
    try {
      val destFile = File(cacheDir, resolveDisplayName(uri) ?: "juce_playback_tmp.audio")

      contentResolver.openInputStream(uri)?.use { input ->
        FileOutputStream(destFile).use { output -> input.copyTo(output) }
      } ?: run {
        Log.e(TAG, "Could not open input stream for $uri")
        return
      }

      val loaded = JuceBridge.audioLoadFile(destFile.absolutePath)
      if (loaded) {
        Log.i(TAG, "Loaded ${destFile.absolutePath}, starting playback")
        JuceBridge.audioPlay()
        JuceBridge.setResamplingRatio(1.0f)
        Testing.startTestThread()

      } else {
        Log.e(TAG, "JUCE failed to load ${destFile.absolutePath}")
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error copying/loading/playing audio", e)
    }
  }

  private fun resolveDisplayName(uri: Uri): String? {
    var cursor: Cursor? = null
    try {
      cursor = contentResolver.query(uri, null, null, null, null)
      val nameIndex = cursor?.getColumnIndex(OpenableColumns.DISPLAY_NAME) ?: -1
      if (cursor != null && nameIndex >= 0 && cursor.moveToFirst()) {
        return cursor.getString(nameIndex)
      }
    } finally {
      cursor?.close()
    }
    return null
  }
}
