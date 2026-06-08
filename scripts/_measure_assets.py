from PIL import Image
import os

roots = ['public/art', 'public/audio',
         'asset-library/2d/tiles', 'asset-library/2d/buildings',
         'asset-library/2d/items', 'asset-library/2d/effects',
         'asset-library/2d/sprites/enemies']
rows = []
n = 0
for root in roots:
    for dp, _, fs in os.walk(root):
        for f in sorted(fs):
            p = os.path.join(dp, f).replace(os.sep, '/')
            ext = f.lower().rsplit('.', 1)[-1]
            if ext in ('png', 'gif'):
                try:
                    im = Image.open(p)
                    rows.append('%s|%dx%d' % (p, im.size[0], im.size[1]))
                    n += 1
                except Exception as e:
                    rows.append('%s|ERR %s' % (p, e))
            elif ext in ('ogg', 'wav', 'mp3'):
                rows.append('%s|audio %db' % (p, os.path.getsize(p)))
                n += 1
with open('scripts/_assetdims.txt', 'w', encoding='utf-8') as out:
    out.write('\n'.join(rows))
print('measured', n, 'files -> scripts/_assetdims.txt')
