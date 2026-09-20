import { renderCharge, renderChargeThumbnail } from './charge-view.mjs';
import { renderPattern, renderPatternThumbnail } from './pattern-view.mjs';

const pattern = (kind) => ({
  render: (demo) => renderPattern(demo, kind),
  thumbnail: (id) => renderPatternThumbnail(kind, id),
  styles: ['pattern.css', 'encounter.css'],
  scripts: ['pattern-player.mjs'],
});
// A new animation registers a server-rendered accessible diagram and its browser assets here.
export const animations = {
  charge: {
    render: renderCharge,
    thumbnail: renderChargeThumbnail,
    styles: ['charge.css', 'encounter.css'],
    scripts: ['charge-player.mjs'],
  },
  sweep: pattern('sweep'),
  'ground-slam': pattern('ground-slam'),
  summon: pattern('summon'),
  'gap-volley': pattern('gap-volley'),
};
