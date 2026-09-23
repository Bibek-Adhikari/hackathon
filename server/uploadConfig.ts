import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { PROJECTS_UPLOAD_DIR, SOLUTIONS_UPLOAD_DIR } from './db.ts';

// Multer storage for project zip files
const projectStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PROJECTS_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const safeExt = '.zip';
    cb(null, `project-${Date.now()}-${uniqueSuffix}${safeExt}`);
  },
});

// Multer storage for solution zip files
const solutionStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, SOLUTIONS_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const safeExt = '.zip';
    cb(null, `solution-${Date.now()}-${uniqueSuffix}${safeExt}`);
  },
});

const zipFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const validExtensions = ['.zip'];
  const validMimetypes = [
    'application/zip',
    'application/x-zip-compressed',
    'multipart/x-zip',
    'application/x-compressed',
    'application/octet-stream', // often sent by browsers for .zip
  ];

  if (validExtensions.includes(ext) && (validMimetypes.includes(file.mimetype) || file.mimetype === 'application/octet-stream')) {
    cb(null, true);
  } else {
    cb(new Error('File upload failed. Only ZIP (.zip) files are allowed.'));
  }
};

export const uploadProjectZip = multer({
  storage: projectStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
  fileFilter: zipFileFilter,
});

export const uploadSolutionZip = multer({
  storage: solutionStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
  fileFilter: zipFileFilter,
});
