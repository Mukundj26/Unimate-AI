import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { db, UPLOADS_DIR } from '../db.ts';
import { getUserIdFromRequest } from './auth.ts';
import { extractTextFromFile } from './files.ts';
import {
  runAssistantRAG,
  runAITutor,
  runQuizGenerator,
  runResumeAnalyzer,
  runSkillGapAnalyzer,
  runStudyPlanner,
  runInterviewCoach,
  runAcademicClassifier,
  runNotesSummarizer,
  runMultilingualProcessor,
} from '../gemini.ts';

export const aiRouter = Router();

// 1. 🤖 AI Assistant (RAG over user files)
aiRouter.post('/assistant', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { question, chatHistory = [], targetFileIds = [], language } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const allUserFiles = db.getAllUserFiles(userId);
    let selectedFiles = allUserFiles;

    if (targetFileIds.length > 0) {
      selectedFiles = allUserFiles.filter(f => targetFileIds.includes(f.id));
    }

    const contextDocs = selectedFiles
      .filter(f => f.textContent && f.textContent.trim().length > 0)
      .map(f => ({
        name: f.originalName,
        content: f.textContent,
      }));

    const result = await runAssistantRAG({
      question,
      chatHistory,
      contextDocs,
      language,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Assistant error:', err);
    res.status(500).json({ error: err.message || 'Assistant failed' });
  }
});

// 2. 👨‍🏫 AI Tutor
aiRouter.post('/tutor', async (req, res) => {
  try {
    const { topicOrQuestion, level = 'Intermediate', explanationStyle = 'Analogy-rich', userBackground, language } = req.body;
    if (!topicOrQuestion) {
      return res.status(400).json({ error: 'Topic or question is required' });
    }

    const result = await runAITutor({
      topicOrQuestion,
      level,
      explanationStyle,
      userBackground,
      language,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Tutor error' });
  }
});

// 3. 📝 Quiz Generator
aiRouter.post('/quiz/generate', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { content, topic, fileId, numQuestions = 5, difficulty = 'medium', language } = req.body;

    let sourceText = content || topic || '';
    let sourceDocName = topic || 'General Knowledge';

    if (fileId) {
      const file = db.getFileById(fileId, userId);
      if (file && file.textContent) {
        sourceText = file.textContent;
        sourceDocName = file.originalName;
      }
    }

    if (!sourceText) {
      sourceText = 'Fundamental concepts in Computer Science, NLP, algorithms, and software engineering';
    }

    const requestedCount = Math.max(1, Math.min(25, parseInt(String(numQuestions), 10) || 5));

    const questions = await runQuizGenerator({
      contentOrTopic: sourceText,
      numQuestions: requestedCount,
      difficulty,
      language,
    });

    res.json({
      title: `Quiz: ${sourceDocName}`,
      sourceDocName,
      questions,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Quiz generation failed' });
  }
});

aiRouter.get('/quiz/list', (req, res) => {
  const userId = getUserIdFromRequest(req);
  const quizzes = db.getQuizzes(userId);
  res.json({ quizzes });
});

aiRouter.post('/quiz/save', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { title, sourceDocName, questions } = req.body;
    const saved = db.saveQuiz({
      userId,
      title: title || 'Saved Quiz',
      sourceDocName,
      questions,
    });
    res.json({ quiz: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

aiRouter.post('/quiz/:id/score', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { score, total } = req.body;
    const updated = db.recordQuizScore(req.params.id, userId, score, total);
    res.json({ quiz: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. 📄 Resume Analyzer
aiRouter.post('/resume', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { resumeText, fileId, targetJobTitle, language } = req.body;

    let textToAnalyze = resumeText || '';
    if (fileId) {
      const file = db.getFileById(fileId, userId);
      if (file) {
        const isCorruptedOrMissing =
          !file.textContent ||
          file.textContent.length < 50 ||
          file.textContent.startsWith('%PDF-') ||
          file.textContent.includes('FlateDecode') ||
          /[^\x20-\x7E\t\r\n]{10,}/.test(file.textContent.slice(0, 200));

        if (isCorruptedOrMissing) {
          const filePath = path.join(UPLOADS_DIR, file.storedFilename);
          if (fs.existsSync(filePath)) {
            const extracted = await extractTextFromFile(filePath, file.mimeType);
            if (extracted && extracted.trim()) {
              file.textContent = extracted;
              db.updateFileTextContent(file.id, extracted);
            }
          }
        }

        if (file.textContent && file.textContent.trim()) {
          textToAnalyze = file.textContent.trim();
        }
      }
    }

    if (!textToAnalyze || textToAnalyze.trim().length < 30) {
      return res.status(400).json({ error: 'Please provide resume text or select an uploaded resume document' });
    }

    const result = await runResumeAnalyzer(textToAnalyze, targetJobTitle, language);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Resume analysis failed' });
  }
});

// 5. 📈 Skill Gap Analyzer
aiRouter.post('/skills', async (req, res) => {
  try {
    const { userSkills = [], targetRole = 'AI / ML Engineer', currentLevel = 'Junior', language } = req.body;
    if (!Array.isArray(userSkills) || userSkills.length === 0) {
      return res.status(400).json({ error: 'Please provide a list of your current skills' });
    }

    const result = await runSkillGapAnalyzer(userSkills, targetRole, currentLevel, language);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Skill gap analysis failed' });
  }
});

// 6. 📅 Study Planner
aiRouter.post('/planner/generate', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const {
      syllabusText,
      syllabusOrTopics,
      goal = 'Complete Exam Prep',
      totalWeeks,
      availableWeeks,
      hoursPerDay,
      hoursPerWeek,
      fileId,
      examDate = '2026-06-15',
      language,
    } = req.body;

    let textToProcess = syllabusOrTopics || syllabusText || '';
    if (fileId) {
      const file = db.getFileById(fileId, userId);
      if (file && file.textContent) {
        textToProcess = file.textContent;
      }
    }

    if (!textToProcess) {
      textToProcess = `Course curriculum for ${goal}: Theory, problem solving, algorithms, practical implementations, and final synthesis.`;
    }

    const weeks = Number(availableWeeks || totalWeeks) || 4;
    const dailyHours = Number(hoursPerDay || (hoursPerWeek ? Math.max(1, Math.round(hoursPerWeek / 5)) : 2)) || 2;

    const generated = await runStudyPlanner({
      syllabusOrTopics: textToProcess,
      goal,
      totalWeeks: weeks,
      hoursPerDay: dailyHours,
      language,
    });

    const savedPlan = db.saveStudyPlan({
      userId,
      title: generated.planTitle || `${goal} Study Plan`,
      goal: goal || 'Certification',
      topics: generated.extractedTopics || [],
      schedule: generated.schedule || [],
      examDate,
    });

    res.json({ plan: savedPlan, generated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Planner failed' });
  }
});

aiRouter.get(['/planner', '/planner/list'], (req, res) => {
  const userId = getUserIdFromRequest(req);
  const plans = db.getStudyPlans(userId);
  res.json({ plans });
});

aiRouter.post('/planner/save', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { title, goal, topics, schedule, examDate } = req.body;
    const plan = db.saveStudyPlan({
      userId,
      title: title || `${goal} Plan`,
      goal: goal || 'Certification',
      topics: topics || [],
      schedule: schedule || [],
      examDate,
    });
    res.json({ plan });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

aiRouter.post('/planner/:id/toggle', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { weekIndex, taskIndex } = req.body;
    const updated = db.toggleStudyTask(req.params.id, userId, Number(weekIndex), Number(taskIndex));
    res.json({ plan: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. 🎤 Interview Coach
const SAMPLE_INTERVIEW_QUESTIONS: Record<string, string[]> = {
  technical: [
    'How would you design a rate limiter for a distributed API handling 100k requests per second?',
    'Explain how attention mechanisms in Transformers solve the vanishing gradient and bottleneck problems in RNNs.',
    'What is the difference between optimistic locking and pessimistic locking, and when would you choose which?',
    'Describe how you would implement vector similarity search and index sharding at scale.',
  ],
  behavioral: [
    'Tell me about a time you had a technical disagreement with a teammate or lead. How did you resolve it?',
    'Describe a project where requirements shifted drastically mid-cycle. What steps did you take?',
    'Give an example of when you diagnosed and mitigated a critical production incident under time pressure.',
  ],
  'system-design': [
    'Design a real-time collaborative document editor with conflict resolution and offline syncing.',
    'Architect a global video streaming platform CDN with low-latency manifest caching and adaptive bitrate.',
    'Design an ATS resume parsing engine that extracts structured entities from 1 million PDFs daily.',
  ],
};

aiRouter.get('/interview/questions', (req, res) => {
  const questionType = (req.query.type as string) || 'technical';
  const questions = SAMPLE_INTERVIEW_QUESTIONS[questionType] || SAMPLE_INTERVIEW_QUESTIONS.technical;
  res.json({ questions });
});

aiRouter.post(['/interview', '/interview/evaluate'], async (req, res) => {
  try {
    const { role, targetRole, questionType = 'technical', question, candidateAnswer, language } = req.body;
    if (!question || !candidateAnswer) {
      return res.status(400).json({ error: 'Question and candidateAnswer are required' });
    }

    const evaluation = await runInterviewCoach({
      role: targetRole || role || 'Senior Software Engineer',
      questionType,
      question,
      candidateAnswer,
      language,
    });

    res.json(evaluation);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Interview evaluation failed' });
  }
});

// 8. 🤝 Academic Exchange
aiRouter.get(['/academic', '/academic/papers', '/academic/search'], (req, res) => {
  const category = req.query.category as string | undefined;
  const query = req.query.q as string | undefined;
  const papers = db.getAcademicPapers(category, query);
  res.json({ papers });
});

aiRouter.post('/academic/classify', async (req, res) => {
  try {
    const { title, content, language } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const classification = await runAcademicClassifier(title, content, language);
    res.json(classification);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Classification failed' });
  }
});

aiRouter.post('/academic/publish', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const user = db.findUserById(userId);
    const { title, category, abstract, content, tags } = req.body;

    const paper = db.addAcademicPaper({
      userId,
      authorName: user?.name || 'Academic Scholar',
      title,
      category: category || 'Computer Science',
      abstract,
      content,
      tags: tags || ['Research'],
    });

    res.json({ paper });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

aiRouter.post('/academic/:id/upvote', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const updated = db.upvoteAcademicPaper(req.params.id, userId);
    res.json({ paper: updated, upvotes: updated ? updated.upvotes : 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. 📚 Notes & Resources
aiRouter.get(['/notes', '/notes/list'], (req, res) => {
  const userId = getUserIdFromRequest(req);
  const notes = db.getNotes(userId);
  res.json({ notes });
});

aiRouter.post('/notes/summarize', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { title, rawText, content, fileId, language } = req.body;

    let contentToSummarize = (content || rawText || '').trim();
    let chosenTitle = title || 'Study Notes';

    if (fileId) {
      const file = db.getFileById(fileId, userId);
      if (file) {
        chosenTitle = title && title !== 'Study Notes' ? title : file.originalName;
        // Check if textContent is missing, corrupted by binary Latin1 read, or needs re-extraction
        const isCorruptedOrMissing =
          !file.textContent ||
          file.textContent.length < 50 ||
          file.textContent.startsWith('%PDF-') ||
          file.textContent.includes('FlateDecode') ||
          /[^\x20-\x7E\t\r\n]{10,}/.test(file.textContent.slice(0, 200));

        if (isCorruptedOrMissing) {
          const filePath = path.join(UPLOADS_DIR, file.storedFilename);
          if (fs.existsSync(filePath)) {
            const extracted = await extractTextFromFile(filePath, file.mimeType);
            if (extracted && extracted.trim()) {
              file.textContent = extracted;
              db.updateFileTextContent(file.id, extracted);
            }
          }
        }

        if (file.textContent && file.textContent.trim()) {
          contentToSummarize = file.textContent.trim();
        }
      }
    }

    if (!contentToSummarize) {
      return res.status(400).json({
        error: 'No text content found to summarize. Please paste study text or select a valid document.'
      });
    }

    const result = await runNotesSummarizer(chosenTitle, contentToSummarize, language);
    res.json({
      title: chosenTitle,
      summary: result.summary || '',
      keyPoints: result.keyPoints || [],
      keywords: result.keywords || [],
      flashcards: result.flashcards || [],
      sourceLength: contentToSummarize.length,
    });
  } catch (err: any) {
    console.error('Notes Summarize Error:', err);
    res.status(500).json({ error: err.message || 'Summarization failed' });
  }
});

aiRouter.post('/notes/save', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { title, content, summary, keyPoints, keywords, flashcards } = req.body;
    const note = db.saveNote({
      userId,
      title: title || 'Quick Notes',
      content: content || '',
      summary: summary || '',
      keyPoints: keyPoints || [],
      keywords: keywords || [],
      flashcards: flashcards || [],
    } as any);
    res.json({ note });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

aiRouter.delete('/notes/:id', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const success = db.deleteNote(req.params.id, userId);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. 🌐 Multilingual + Voice
aiRouter.post('/multilingual', async (req, res) => {
  try {
    const { text, targetLanguage = 'Marathi' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for translation' });
    }

    const result = await runMultilingualProcessor(text, targetLanguage);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Translation failed' });
  }
});
