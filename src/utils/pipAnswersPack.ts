import type { Paragraph as DocxParagraph } from 'docx';
import { PIP_QUESTIONS, type PIPQuestion } from '../pipQuestions';

export function stripHtmlForExport(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseDescriptor(saved: string | undefined, q: PIPQuestion): { code: string; points: number; line: string } | null {
  if (!saved?.trim()) return null;
  const m = saved.trim().match(/^Descriptor\s+([A-Z]+)$/i);
  if (!m) return null;
  const code = m[1].toUpperCase();
  const d = q.descriptors.find((x) => x.code === code);
  if (!d) return { code, points: 0, line: `Descriptor ${code}` };
  return { code, points: d.points, line: `Descriptor ${code} · ${d.points} pts — ${d.text}` };
}

export function formatAnswerBody(
  q: PIPQuestion,
  saved: string | undefined,
  details?: { difficulties: string[]; answerText?: string },
): { descriptor: ReturnType<typeof parseDescriptor>; difficulties: string[]; prose: string | null } {
  const descriptor = parseDescriptor(saved, q);
  const difficulties = details?.difficulties?.filter(Boolean) ?? [];
  let prose: string | null = null;
  if (details?.answerText?.trim()) {
    prose = stripHtmlForExport(details.answerText);
  } else if (saved?.trim()) {
    const onlyDescriptor = /^Descriptor\s+[A-Z]+$/i.test(saved.trim());
    if (!onlyDescriptor) {
      prose = stripHtmlForExport(saved);
    }
  }
  return { descriptor, difficulties, prose };
}

function hasAnyStoredContent(
  q: PIPQuestion,
  saved: string | undefined,
  details?: { difficulties: string[]; answerText?: string },
): boolean {
  const { descriptor, difficulties, prose } = formatAnswerBody(q, saved, details);
  return !!(descriptor || difficulties.length || prose);
}

export function questionHasStoredAnswer(
  q: PIPQuestion,
  savedAnswers: Record<string, string>,
  savedAnswerDetails: Record<string, { difficulties: string[]; answerText?: string }>,
): boolean {
  return hasAnyStoredContent(q, savedAnswers[q.id], savedAnswerDetails[q.id]);
}

export interface AnswersPackOpts {
  savedAnswers: Record<string, string>;
  savedAnswerDetails: Record<string, { difficulties: string[]; answerText?: string }>;
  cocMode: boolean;
  userLabel?: string;
}

export function buildAnswersPlainText(opts: AnswersPackOpts): string {
  const { savedAnswers, savedAnswerDetails, cocMode, userLabel } = opts;
  const lines: string[] = [];
  const now = new Date();
  lines.push('PIPPal — Your PIP answers');
  lines.push(`Exported ${now.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`);
  if (userLabel) lines.push(`Account / name: ${userLabel}`);
  lines.push(`Walkthrough: ${cocMode ? 'Change of circumstances' : 'PIP questions'}`);
  lines.push('');
  lines.push('—'.repeat(48));

  const sections: { title: string; qs: PIPQuestion[] }[] = [
    { title: 'Daily Living', qs: PIP_QUESTIONS.filter((q) => q.category === 'Daily Living') },
    { title: 'Mobility', qs: PIP_QUESTIONS.filter((q) => q.category === 'Mobility') },
  ];

  for (const sec of sections) {
    lines.push('');
    lines.push(sec.title.toUpperCase());
    lines.push('—'.repeat(48));

    for (const q of sec.qs) {
      const saved = savedAnswers[q.id];
      const details = savedAnswerDetails[q.id];
      const { descriptor, difficulties, prose } = formatAnswerBody(q, saved, details);
      const has = hasAnyStoredContent(q, saved, details);

      lines.push('');
      lines.push(`Activity ${q.num}: ${q.title}`);
      lines.push(q.headline);
      if (q.subtext?.trim()) lines.push(q.subtext);
      lines.push(`Form reference: ${q.pipFormRef}`);
      if (!has) {
        lines.push('(Not answered yet in PIPpal)');
        continue;
      }
      if (descriptor) lines.push(descriptor.line);
      if (difficulties.length) {
        lines.push('Difficulties selected:');
        difficulties.forEach((t) => lines.push(`  • ${t}`));
      }
      if (prose) {
        lines.push('Your wording:');
        lines.push(prose);
      } else if (!descriptor && difficulties.length === 0 && saved?.trim()) {
        lines.push(stripHtmlForExport(saved));
      }
    }
  }

  lines.push('');
  lines.push('—'.repeat(48));
  lines.push('PIPpal is a guide — always review before sending to DWP.');
  lines.push('');
  return lines.join('\n');
}

/** Generates a Word (.docx) blob — loads docx library only when called */
export async function buildAnswersDocxBlob(opts: AnswersPackOpts): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');

  function lineParagraph(runs: InstanceType<typeof TextRun>[], spacing: { before?: number; after?: number } = { after: 120 }) {
    return new Paragraph({
      spacing,
      children: runs,
    });
  }

  function proseParagraphs(label: string, text: string): InstanceType<typeof Paragraph>[] {
    const out: InstanceType<typeof Paragraph>[] = [];
    out.push(
      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [new TextRun({ text: label, bold: true, color: '525252' })],
      }),
    );
    const chunks = text.trim().split(/\n+/).filter(Boolean);
    const toEmit = chunks.length > 0 ? chunks : (text.trim() ? [text.trim()] : []);
    for (const chunk of toEmit) {
      out.push(
        new Paragraph({
          spacing: { after: 160 },
          children: [new TextRun({ text: chunk })],
        }),
      );
    }
    return out;
  }

  const { savedAnswers, savedAnswerDetails, cocMode, userLabel } = opts;
  const now = new Date();
  const children: DocxParagraph[] = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: 'PIPPal — Your PIP answers', bold: true })],
    }),
  );

  children.push(
    lineParagraph([
      new TextRun({
        text: `Exported ${now.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`,
        italics: true,
        color: '737373',
      }),
    ]),
  );
  if (userLabel) {
    children.push(lineParagraph([new TextRun({ text: `Account / name: ${userLabel}`, color: '525252' })]));
  }
  children.push(
    lineParagraph([
      new TextRun({
        text: `Walkthrough: ${cocMode ? 'Change of circumstances' : 'PIP questions'}`,
        color: '525252',
      }),
    ]),
  );

  const sections: { title: string; qs: PIPQuestion[] }[] = [
    { title: 'Daily Living', qs: PIP_QUESTIONS.filter((q) => q.category === 'Daily Living') },
    { title: 'Mobility', qs: PIP_QUESTIONS.filter((q) => q.category === 'Mobility') },
  ];

  for (const sec of sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 200 },
        children: [new TextRun({ text: sec.title, bold: true })],
      }),
    );

    for (const q of sec.qs) {
      const saved = savedAnswers[q.id];
      const details = savedAnswerDetails[q.id];
      const { descriptor, difficulties, prose } = formatAnswerBody(q, saved, details);
      const has = hasAnyStoredContent(q, saved, details);

      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 120 },
          children: [
            new TextRun({
              text: `${q.category === 'Daily Living' ? 'Daily living' : 'Mobility'} · Activity ${q.num}: ${q.title}`,
              bold: true,
            }),
          ],
        }),
      );

      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: q.headline, bold: true })],
        }),
      );

      if (q.subtext?.trim()) {
        children.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: q.subtext, color: '404040' })],
          }),
        );
      }

      children.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `Form reference: ${q.pipFormRef}`,
              italics: true,
              color: '737373',
              size: 20,
            }),
          ],
        }),
      );

      if (!has) {
        children.push(
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: '(Not answered yet in PIPpal)',
                italics: true,
                color: 'A3A3A3',
              }),
            ],
          }),
        );
        continue;
      }

      if (descriptor) {
        children.push(
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({ text: 'Selected descriptor: ', bold: true, color: '0F766E' }),
              new TextRun({ text: descriptor.line, color: '134E4A' }),
            ],
          }),
        );
      }

      if (difficulties.length) {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 80 },
            children: [new TextRun({ text: 'What affects you', bold: true, color: '525252' })],
          }),
        );
        for (const t of difficulties) {
          children.push(
            new Paragraph({
              spacing: { after: 80 },
              bullet: { level: 0 },
              children: [new TextRun({ text: t })],
            }),
          );
        }
      }

      if (prose) {
        children.push(...proseParagraphs('Your answer', prose));
      } else if (!descriptor && difficulties.length === 0 && saved?.trim()) {
        children.push(...proseParagraphs('Your answer', stripHtmlForExport(saved)));
      }
    }
  }

  children.push(
    new Paragraph({
      spacing: { before: 400, after: 120 },
      children: [
        new TextRun({
          text: 'PIPpal is a guide — always review before sending to DWP.',
          italics: true,
          color: '737373',
          size: 20,
        }),
      ],
    }),
  );

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBlob(doc);
}
