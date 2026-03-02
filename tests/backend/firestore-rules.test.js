/**
 * Firestore Security Rules Unit Tests
 *
 * Run with:
 *   firebase emulators:start --only firestore
 *   jest --config tests/backend/jest.config.js
 *
 * Install the SDK first:
 *   pnpm add -D @firebase/rules-unit-testing
 */

const fs   = require('fs');
const path = require('path');

// @firebase/rules-unit-testing must be installed separately (see README above).
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');

const RULES_PATH = path.resolve(__dirname, '../../firestore.rules');

let testEnv;

// ── Setup / Teardown ──────────────────────────────────────────────────────────

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'reamot-test',
    firestore: {
      rules: fs.readFileSync(RULES_PATH, 'utf8'),
      host:  'localhost',
      port:  8080,
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function patientDb(email) {
  return testEnv
    .authenticatedContext(email.replace(/[@.]/g, '_'), { email })
    .firestore();
}

function unauthDb() {
  return testEnv.unauthenticatedContext().firestore();
}

// ── medicine (global catalogue) ───────────────────────────────────────────────

describe('medicine collection', () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async ctx => {
      await ctx.firestore()
        .collection('medicine')
        .doc('aspirin')
        .set({ name: 'Aspirin', barcode: '001' });
    });
  });

  it('allows an authenticated user to read the catalogue', async () => {
    const db = patientDb('patient@example.com');
    await assertSucceeds(db.collection('medicine').doc('aspirin').get());
  });

  it('denies an unauthenticated user from reading the catalogue', async () => {
    await assertFails(unauthDb().collection('medicine').doc('aspirin').get());
  });

  it('denies any client from writing to the catalogue', async () => {
    const db = patientDb('patient@example.com');
    await assertFails(
      db.collection('medicine').doc('new').set({ name: 'NewDrug' }),
    );
  });
});

// ── reminder ─────────────────────────────────────────────────────────────────

describe('reminder collection', () => {
  const PATIENT_EMAIL = 'patient@example.com';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async ctx => {
      await ctx.firestore()
        .collection('reminder')
        .doc('rem1')
        .set({ patientEmail: PATIENT_EMAIL, medicine: 'Aspirin' });
    });
  });

  it('allows a patient to read their own reminder', async () => {
    const db = patientDb(PATIENT_EMAIL);
    await assertSucceeds(db.collection('reminder').doc('rem1').get());
  });

  it('denies a different patient from reading the reminder', async () => {
    const db = patientDb('other@example.com');
    await assertFails(db.collection('reminder').doc('rem1').get());
  });

  it('denies an unauthenticated user from reading reminders', async () => {
    await assertFails(unauthDb().collection('reminder').doc('rem1').get());
  });
});

// ── prescription ──────────────────────────────────────────────────────────────

describe('prescription collection', () => {
  const PATIENT_EMAIL = 'patient@example.com';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async ctx => {
      await ctx.firestore()
        .collection('prescription')
        .doc('pres1')
        .set({ patientEmail: PATIENT_EMAIL, name: 'Aspirin', adder: 'patient' });
    });
  });

  it('allows the patient to read their own prescription', async () => {
    const db = patientDb(PATIENT_EMAIL);
    await assertSucceeds(db.collection('prescription').doc('pres1').get());
  });

  it('denies another patient from reading the prescription', async () => {
    const db = patientDb('other@example.com');
    await assertFails(db.collection('prescription').doc('pres1').get());
  });

  it('allows the patient to create a prescription for themselves', async () => {
    const db = patientDb(PATIENT_EMAIL);
    await assertSucceeds(
      db.collection('prescription').add({
        patientEmail: PATIENT_EMAIL,
        name:         'Ibuprofen',
        adder:        'patient',
      }),
    );
  });

  it('denies a patient from creating a prescription for another patient', async () => {
    const db = patientDb(PATIENT_EMAIL);
    await assertFails(
      db.collection('prescription').add({
        patientEmail: 'victim@example.com',
        name:         'Ibuprofen',
        adder:        'patient',
      }),
    );
  });
});

// ── history ───────────────────────────────────────────────────────────────────

describe('history collection', () => {
  const PATIENT_EMAIL = 'patient@example.com';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async ctx => {
      await ctx.firestore()
        .collection('history')
        .doc('hist1')
        .set({
          patientEmail: PATIENT_EMAIL,
          medicine:     'Aspirin',
          status:       'taken',
          date:         'February 25th 2026',
        });
    });
  });

  it('allows the patient to read their own history', async () => {
    const db = patientDb(PATIENT_EMAIL);
    await assertSucceeds(db.collection('history').doc('hist1').get());
  });

  it('denies another patient from reading the history', async () => {
    const db = patientDb('eavesdropper@example.com');
    await assertFails(db.collection('history').doc('hist1').get());
  });

  it('denies an unauthenticated user from reading history', async () => {
    await assertFails(unauthDb().collection('history').doc('hist1').get());
  });

  it('denies a patient from writing a history record for another patient', async () => {
    const db = patientDb(PATIENT_EMAIL);
    await assertFails(
      db.collection('history').add({
        patientEmail: 'victim@example.com',
        medicine:     'Aspirin',
        status:       'taken',
        date:         'February 25th 2026',
      }),
    );
  });
});

// ── doctor profiles ───────────────────────────────────────────────────────────

describe('doctor collection', () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async ctx => {
      await ctx.firestore()
        .collection('doctor')
        .doc('doc1')
        .set({ doctorEmail: 'dr.smith@hospital.com', name: 'Dr Smith' });
    });
  });

  it('allows any authenticated user to read a doctor profile', async () => {
    const db = patientDb('patient@example.com');
    await assertSucceeds(db.collection('doctor').doc('doc1').get());
  });

  it('denies an unauthenticated user from reading doctor profiles', async () => {
    await assertFails(unauthDb().collection('doctor').doc('doc1').get());
  });
});
