export interface PipDiaryExportEntry {
  activityLabel: string;
  note: string;
}

export interface PipDiaryExportDay {
  dayName: string;
  dateLabel: string;
  entries: PipDiaryExportEntry[];
}

export interface PipDiaryExportWeek {
  weekLabel: string;
  days: PipDiaryExportDay[];
}

export async function buildPipDiaryDocxBlob(opts: {
  weeks: PipDiaryExportWeek[];
  userLabel?: string;
}): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
  const { weeks, userLabel } = opts;
  const now = new Date();

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 240 },
      children: [new TextRun({ text: 'PIP Weekly Diary', bold: true, font: 'Arial' })],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `Exported ${now.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`,
          italics: true,
          color: '737373',
          font: 'Arial',
        }),
      ],
    }),
  ];

  if (userLabel) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: `Name: ${userLabel}`, font: 'Arial' })],
      }),
    );
  }

  children.push(
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: 'Use this diary to record how your condition affects you each day. For each activity describe what happened — whether you could do it safely, if you needed help, or if you used any aids. Focus on your worst days. This diary can be submitted as supporting evidence with your PIP claim.',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: 'Full name: ___________________________', font: 'Arial' })],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: 'National Insurance number: ___________________________', font: 'Arial' })],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: 'Date of birth: ___________________________', font: 'Arial' })],
    }),
    new Paragraph({
      spacing: { after: 360 },
      children: [new TextRun({ text: 'PIP reference (if known): ___________________________', font: 'Arial' })],
    }),
  );

  for (const week of weeks) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 280, after: 200 },
        children: [new TextRun({ text: `Week of ${week.weekLabel}`, bold: true, font: 'Arial' })],
      }),
    );

    for (const day of week.days) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 120 },
          children: [
            new TextRun({ text: `${day.dayName} — ${day.dateLabel}`, bold: true, font: 'Arial' }),
          ],
        }),
      );

      for (const entry of day.entries) {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 80 },
            children: [new TextRun({ text: entry.activityLabel, bold: true, font: 'Arial' })],
          }),
        );
        const noteLines = entry.note.split('\n').filter((line) => line.length > 0);
        const linesToRender = noteLines.length > 0 ? noteLines : [entry.note.trim()];
        for (const line of linesToRender) {
          if (!line.trim()) continue;
          children.push(
            new Paragraph({
              spacing: { after: 120 },
              children: [new TextRun({ text: line, font: 'Arial' })],
            }),
          );
        }
      }
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBlob(doc);
}
