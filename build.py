#!/usr/bin/env python3
"""Build Oil Management from ordered source modules. No external packages."""
from pathlib import Path
import json,subprocess,sys
root=Path(__file__).resolve().parent
manifest=json.loads((root/'build.json').read_text(encoding='utf-8'))
parts=[(root/p).read_text(encoding='utf-8') for p in manifest['parts']]
output=root/manifest['entry']
output.parent.mkdir(parents=True,exist_ok=True)
output.write_text(''.join(parts),encoding='utf-8')
check=subprocess.run(['node','--check',str(output)])
if check.returncode:sys.exit(check.returncode)
print('Built',output.relative_to(root),'from',len(parts),'modules')
