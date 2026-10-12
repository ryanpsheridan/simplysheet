#!/usr/bin/env python3
"""Render a Pinterest pin (1000x1500 PNG, optional mp4) from a JSON spec.

Usage:  python3 scripts/pins/make_pin.py scripts/pins/specs/<slug>.json [--video]
Output: public/images/pins/<slug>.png (and <slug>.mp4 with --video)

Spec layouts:
  calc     headline, lede, card_title, fields[{label,value}], result{label,value,rows[{label,value}]}, caption
  compare  headline, lede, columns[{name, tint: sky|lavender|sand, rows[{k,v}]}]
Rules: sentence case, no all-caps, no em dashes, headlines balanced (no widows).
"""
import json, os, re, subprocess, sys, shutil
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.environ.get("PIN_OUT") or os.path.join(ROOT, "public", "images", "pins")
FONTS = os.path.join(ROOT, "public", "fonts")
LOGO = os.path.join(HERE, "assets", "logo.svg")

CSS = f"""
@font-face{{font-family:Aspekta;src:url("file://{FONTS}/AspektaVF.woff2");font-weight:100 900}}
@font-face{{font-family:InterV;src:url("file://{FONTS}/InterVF.woff2");font-weight:100 900}}
:root{{--ink:#26352C;--ink2:#5C5C57;--paper:#F7F7F2;--emph:#EEEEE7;--line:#DDDDD7;--sky:#B0E0FF;--sand:#EFE4B4;--lavender:#DAD6FF}}
*{{box-sizing:border-box;margin:0}}
.pin{{width:1000px;height:1500px;overflow:hidden;background:var(--paper);font-family:InterV,sans-serif;color:var(--ink);display:flex;flex-direction:column;padding:96px 80px 72px}}
h1{{text-wrap:balance;font-family:Aspekta,InterV,sans-serif;font-weight:500;letter-spacing:-.035em;font-size:84px;line-height:92px}}
.lede{{text-wrap:pretty;margin-top:28px;font-size:36px;line-height:48px;letter-spacing:-.015em;color:var(--ink2);padding-right:20px}}
.body{{margin-top:56px}}
.brand{{margin-top:auto;display:flex;align-items:center;gap:16px;font-family:Aspekta,InterV,sans-serif;font-weight:500;font-size:34px;letter-spacing:-.02em}}
.brand img{{height:44px}}
.cap{{text-wrap:pretty;margin:40px 0 48px;font-size:30px;line-height:44px;letter-spacing:-.015em}}
.cap span{{color:var(--ink2)}}
.frame{{background:var(--emph);border-radius:40px;padding:40px}}
.frame h2{{font-family:Aspekta,InterV,sans-serif;font-weight:500;font-size:44px;letter-spacing:-.025em;margin-bottom:24px}}
.fld{{margin-bottom:20px}}
.lab{{font-size:28px;font-weight:500;margin-bottom:10px}}
.inp{{background:#fff;border:1.5px solid var(--line);border-radius:20px;height:76px;display:flex;align-items:center;padding:0 28px;font-size:38px;letter-spacing:-.01em}}
.inp.on{{border-color:var(--ink);box-shadow:0 0 0 4px rgba(176,224,255,.7)}}
.caret{{display:none;width:3px;height:42px;background:var(--ink);margin-left:4px}}.on .caret{{display:inline-block}}
.res{{background:#fff;border:1.5px solid var(--line);border-radius:28px;padding:28px 32px;margin-top:28px}}
.res .sm{{font-size:28px;color:var(--ink2)}}
.res .big{{font-family:Aspekta,InterV,sans-serif;font-weight:500;font-size:96px;letter-spacing:-.04em;line-height:104px;margin-top:6px}}
.res .r2{{display:flex;justify-content:space-between;align-items:baseline;border-top:1.5px solid var(--line);margin-top:22px;padding-top:20px;font-size:31px}}
.res .r2 b{{font-weight:500;font-size:35px}}
.dim{{opacity:.3}}
.cols{{display:grid;grid-template-columns:1fr 1fr;gap:24px}}
.col{{background:#fff;border:1.5px solid var(--line);border-radius:32px;overflow:hidden;padding-bottom:32px}}
.col .hd{{height:150px;display:flex;align-items:center;justify-content:center;font-family:Aspekta,InterV,sans-serif;font-weight:500;font-size:40px;letter-spacing:-.02em}}
.sky{{background:var(--sky)}}.lavender{{background:var(--lavender)}}.sand{{background:var(--sand)}}
.row{{padding:24px 28px 0}}
.k{{font-size:24px;line-height:30px;color:var(--ink2);margin-bottom:6px}}
.v{{font-size:32px;line-height:40px;font-weight:500;letter-spacing:-.015em}}
"""


THEMES = {
 "sky": ".pin{background:#B0E0FF}.frame{background:rgba(255,255,255,.55)}.inp{border-color:#fff}.res{border-color:#fff}.cap span,.lede{color:#3F4A44}",
 "charcoal": ".pin{background:#292929;color:#fff}h1{color:#fff}.lede{color:#B5B5B0}.frame{background:#353535}.frame h2{color:#fff}.lab{color:#fff}.inp,.res{color:#26352C}.inp{border-color:#fff}.inp.on{border-color:#B0E0FF}.res{border-color:#fff}.cap{color:#fff}.cap span{color:#B5B5B0}.brand{color:#fff}",
 "sand": ".pin{background:#F1E7C0}.frame{background:#DAD6FF}.lede{color:#4E4A3A}.cap span{color:#4E4A3A}.inp{border-color:#fff}.res{border-color:#fff}",
}

def esc(s): return (s.replace("&", "&amp;").replace("<", "&lt;"))

def build(spec, animate=False):
    compact = spec["layout"] == "calc" and len(spec["fields"]) > 2
    extra = ".inp{height:64px;font-size:34px}.fld{margin-bottom:14px}.lab{font-size:26px;margin-bottom:8px}.frame{padding:32px 40px}.frame h2{margin-bottom:16px}.res{padding:22px 32px;margin-top:20px}.res .big{font-size:84px;line-height:90px}.res .r2{margin-top:16px;padding-top:16px}.body{margin-top:40px}" if compact else ""
    h = [f"<style>{CSS}{extra}{THEMES.get(spec.get("theme",""),"")}</style><div class='pin' id='pin'>",
         f"<h1>{esc(spec['headline'])}</h1><div class='lede'>{esc(spec['lede'])}</div><div class='body'>"]
    if spec["layout"] == "calc":
        h.append(f"<div class='frame'><h2>{esc(spec['card_title'])}</h2>")
        for i, f in enumerate(spec["fields"]):
            val = "" if animate else esc(f["value"])
            h.append(f"<div class='fld'><div class='lab'>{esc(f['label'])}</div><div class='inp' id='i{i}'><span id='t{i}'>{val}</span><i class='caret' id='c{i}'></i></div></div>")
        r = spec["result"]
        big = "$0" if animate else esc(r["value"])
        h.append(f"<div class='res'><div class='sm'>{esc(r['label'])}</div><div class='big{' dim' if animate else ''}' id='big'>{big}</div>")
        for j, row in enumerate(r.get("rows", [])):
            h.append(f"<div class='r2 rr' id='rr{j}' style='{'opacity:0' if animate else ''}'><span>{esc(row['label'])}</span><b>{esc(row['value'])}</b></div>")
        h.append("</div></div>")
        if spec.get("caption"):
            h.append(f"<div class='cap'>{esc(spec['caption'])}</div>")
    else:
        h.append("<div class='cols'>")
        for c in spec["columns"]:
            h.append(f"<div class='col'><div class='hd {c.get('tint','sky')}'>{esc(c['name'])}</div>")
            for row in c["rows"]:
                h.append(f"<div class='row'><div class='k'>{esc(row['k'])}</div><div class='v'>{esc(row['v'])}</div></div>")
            h.append("</div>")
        h.append("</div>")
    h.append(f"</div><div class='brand'><img src='file://{LOGO}'><span>Simply Sheets</span></div></div>")
    return "".join(h)

ANIM_JS = """
const SPEC=%s;
const ease=x=>1-Math.pow(1-x,3);
function fmt(n,dec){return n.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec})}
function setT(t){
 let start=0.7,gap=0.35,endTyping=start;
 SPEC.fields.forEach((f,i)=>{
  const per=Math.min(0.3,1.2/f.value.length), dur=f.value.length*per;
  const n=Math.max(0,Math.min(f.value.length,Math.floor((t-start)/per)+1));
  document.getElementById('t'+i).textContent=t>=start?f.value.slice(0,n):'';
  const on=t>=start-0.1&&t<start+dur+0.4;
  document.getElementById('i'+i).classList.toggle('on',on);
  document.getElementById('c'+i).style.visibility=(Math.floor(t*2)%%2==0||((t-start)%%per)<per*0.7)?'visible':'hidden';
  start+=dur+0.6; endTyping=start;
 });
 const m=SPEC.result.value.match(/^(\\D*)([\\d,]+(?:\\.\\d+)?)(\\D*)$/);
 const p=Math.max(0,Math.min(1,(t-endTyping)/1.0)), e=ease(p);
 const big=document.getElementById('big'); big.classList.toggle('dim',t<endTyping);
 if(m){const dec=(m[2].split('.')[1]||'').length; big.textContent=m[1]+fmt(parseFloat(m[2].replace(/,/g,''))*e,dec)+m[3];} else {big.textContent=t>=endTyping?SPEC.result.value:'';}
 (SPEC.result.rows||[]).forEach((r,j)=>{document.getElementById('rr'+j).style.opacity=Math.max(0,Math.min(1,(t-endTyping-0.8-j*0.25)/0.4))});
}
setT(0);
"""

def page_file(html):
    path = os.path.join("/tmp", "pin-render.html")
    open(path, "w").write("<!doctype html><meta charset='utf-8'>" + html)
    return "file://" + path

def main():
    spec_path = sys.argv[1]; video = "--video" in sys.argv
    spec = json.load(open(spec_path)); slug = spec["slug"]
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        try: b = p.chromium.launch()
        except Exception: b = p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"))
        pg = b.new_page(viewport={"width": 1000, "height": 1500})
        pg.goto(page_file(build(spec))); pg.wait_for_timeout(800)
        pg.locator("#pin").screenshot(path=os.path.join(OUT, slug + ".png"))
        print("wrote", slug + ".png")
        if video and spec["layout"] == "calc":
            pg.goto(page_file(build(spec, animate=True) + "<script>" + (ANIM_JS % json.dumps(spec)) + "</script>")); pg.wait_for_timeout(800)
            fdir = os.path.join("/tmp", "pinframes-" + slug); shutil.rmtree(fdir, ignore_errors=True); os.makedirs(fdir)
            FPS, DUR = 30, spec.get("video_seconds", 8)
            for i in range(FPS * DUR):
                pg.evaluate(f"setT({i/FPS})"); pg.locator("#pin").screenshot(path=f"{fdir}/f{i:04d}.png")
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", f"{fdir}/f%04d.png", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-movflags", "+faststart", os.path.join(OUT, slug + ".mp4")], check=True)
            print("wrote", slug + ".mp4")
        b.close()
main()
