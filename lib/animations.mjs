import { renderCharge, renderChargeThumbnail } from './charge-view.mjs';
// A new animation registers a server-rendered accessible diagram and its browser assets here.
export const animations = {
  charge: {
    render: renderCharge,
    thumbnail: renderChargeThumbnail,
    styles: ['charge.css'],
    scripts: ['charge-player.mjs'],
  },
};
