const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/telegram/telegram.service.ts', 'utf8');

const startMarker = '  // ── VACANCY ──';
const endMarker = '  // ── MENTOR ──';
const startIdx = c.indexOf(startMarker);
const endIdx = c.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found!', startIdx, endIdx);
  process.exit(1);
}

const newVacancy = `  // ── VACANCY ──
  private formatVacancy(p: any, authorName: string, channel: string, link: string): string {
    const lines: string[] = [
      \`<b>Xodim kerak:</b>\`,
      '',
    ];
    if (p.company) lines.push(\`🏢 <b>Idora:</b> \${p.company}\`);
    if (p.technologies?.length) lines.push(\`📚 <b>Texnologiya:</b> \${p.technologies.join(', ')}\`);
    if (p.contactTelegram) lines.push(\`🇺🇿 <b>Telegram:</b> \${p.contactTelegram}\`);
    if (p.contactPhone) lines.push(\`📞 <b>Aloqa:</b> \${p.contactPhone}\`);
    if (p.city) lines.push(\`🌐 <b>Hudud:</b> \${p.city}\`);
    lines.push(\`👷 <b>Mas'ul:</b> \${authorName}\`);
    if (p.link) lines.push(\`🕰 <b>Murojaat vaqti:</b> \${p.link}\`);
    if (p.workType) lines.push(\`🕐 <b>Ish vaqti:</b> \${p.workType}\`);
    if (p.salary) lines.push(\`💰 <b>Maosh:</b> \${p.salary}\`);
    if (p.description) {
      lines.push(\`‼️ <b>Qo'shimcha:</b> \${p.description.length > 500 ? p.description.substring(0, 500) + '...' : p.description}\`);
    }
    lines.push('');
    lines.push(\`#ishJoyi \${this.buildHashtags(p)}\`);
    lines.push('');
    lines.push(\`👉 \${channel} kanaliga ulanish\`);
    return lines.join('\\n');
  }

`;

c = c.substring(0, startIdx) + newVacancy + c.substring(endIdx);
fs.writeFileSync('backend/src/modules/telegram/telegram.service.ts', c);
console.log('VACANCY template replaced successfully');
