"""Remapeia o tempo do render antigo (voz lenta) para a voz nova (mais enxuta), alinhando as frases uma a uma."""
import json
_o = json.load(open('work_old/phrases.json'))['phrases']; _nj = json.load(open('work/phrases.json')); _n = _nj['phrases']
NEW_DUR = _nj['duration']
assert len(_o) == len(_n), 'número de frases difere'
A_new = [0.0] + [x for p in _n for x in (p['s'], p['e'])] + [NEW_DUR]
A_old = [0.0] + [x for p in _o for x in (p['s'], p['e'])] + [_o[-1]['e'] + (NEW_DUR - _n[-1]['e'])]
def _interp(x, xs, ys):
    if x <= xs[0]: return ys[0]
    for i in range(1, len(xs)):
        if x <= xs[i]:
            d = xs[i] - xs[i - 1]; t = 0 if d <= 0 else (x - xs[i - 1]) / d
            return ys[i - 1] + t * (ys[i] - ys[i - 1])
    return ys[-1] + (x - xs[-1])
n2o = lambda t: _interp(t, A_new, A_old)
o2n = lambda t: _interp(t, A_old, A_new)
if __name__ == '__main__':
    import os, shutil
    os.makedirs('frames_new', exist_ok=True)
    N = int(NEW_DUR * 30 + 0.5); mx = 2342
    for n in range(N):
        o = min(mx, max(0, int(round(n2o(n / 30) * 30))))
        dst = f'frames_new/f{n:04d}.jpg'
        if os.path.lexists(dst): os.remove(dst)
        os.symlink(os.path.abspath(f'frames/f{o:04d}.jpg'), dst)
    print('frames_new', N, 'duração', round(NEW_DUR, 2))
