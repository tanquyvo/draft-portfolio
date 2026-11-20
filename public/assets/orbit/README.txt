COVER ORBIT IMAGE
=================

This folder stores the small character that travels around the yellow Cover circle.

Current image:
  orbit-character.png

To replace it:
1. Put your new transparent PNG in this folder.
2. Name it orbit-character.png (overwrite the existing file).
3. Refresh the Vite page. No code change is needed.

If you want to use a different filename, update this path in index.html:
  /assets/orbit/orbit-character.png

To resize the orbiting character, edit .cover-orbit-planet in src/styles.css.
The orbit speed is controlled by the 34s duration in cover-orbit-spin and
cover-orbit-counterspin.
