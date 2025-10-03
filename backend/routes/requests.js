// backend/routes/requests.oop.js
const express = require('express');
const router = express.Router();

// Use your existing Mongoose models
const RequestModel = require('../models/Request');
const DonorModel   = require('../models/Donor');

/* =========================
   Abstraction: BaseController
   ========================= */
class BaseController {
  ok(res, data)      { return res.status(200).json(data); }
  created(res, data) { return res.status(201).json(data); }
  fail(res, code, e) { return res.status(code).json({ error: e?.message || String(e) }); }
}

/* ======================================
   Abstraction: MatchingStrategy (abstract)
   ====================================== */
class MatchingStrategy {
  // to be implemented by concrete strategies
  // eslint-disable-next-line no-unused-vars
  async match(ctx) { throw new Error('match() must be implemented'); }
}

/* ==========================================
   Inheritance + Polymorphism: Concrete strategies
   ========================================== */
class ExactMatchStrategy extends MatchingStrategy {
  async match({ DonorModel, request }) {
    return DonorModel.find({ bloodType: request.bloodTypeNeeded })
      .select('name contactNumber email lastDonationDate bloodType')
      .sort({ lastDonationDate: -1 });
  }
}

const COMPATIBLE = {
  'O-': ['O-'],
  'O+': ['O-','O+'],
  'A-': ['O-','A-'],
  'A+': ['O-','O+','A-','A+'],
  'B-': ['O-','B-'],
  'B+': ['O-','O+','B-','B+'],
  'AB-':['O-','A-','B-','AB-'],
  'AB+':['O-','O+','A-','A+','B-','B+','AB-','AB+'],
};

class CompatibleMatchStrategy extends MatchingStrategy {
  async match({ DonorModel, request }) {
    const set = COMPATIBLE[request.bloodTypeNeeded] || [];
    return DonorModel.find({ bloodType: { $in: set } })
      .select('name contactNumber email lastDonationDate bloodType')
      .sort({ lastDonationDate: -1 });
  }
}

/* ==============================
   Encapsulation: MatchingContext
   ============================== */
class MatchingContext {
  #strategy;
  constructor(strategy) { this.#strategy = strategy; }
  setStrategy(strategy) { this.#strategy = strategy; }
  async execute(ctx)    { return this.#strategy.match(ctx); } // polymorphic dispatch
}

/* ==================================
   Encapsulation: Repositories (data)
   ================================== */
class RequestRepository {
  async create(payload) { return RequestModel.create(payload); }
  async findById(id)    { return RequestModel.findById(id); }
}

class DonorRepository {
  get model() { return DonorModel; } // expose read-only
}

/* ============================================
   Service/Facade: compose repos + strategies
   ============================================ */
class RequestService {
  #requestRepo;
  #donorRepo;

  constructor() {
    this.#requestRepo = new RequestRepository();
    this.#donorRepo   = new DonorRepository();
  }

  /**
   * High-level API used by controller
   * @param {*} payload { patientName, bloodTypeNeeded, hospitalName, status }
   * @param {*} opts    { strategy: 'compatible' | 'exact' }
   * @returns { request, matches, matchedNames }
   */
  async createAndMatch(payload, { strategy = 'compatible' } = {}) {
    const request = await this.#requestRepo.create(payload);

    const strategyImpl = strategy === 'exact'
      ? new ExactMatchStrategy()
      : new CompatibleMatchStrategy();

    const ctx = new MatchingContext(strategyImpl);
    const matches = await ctx.execute({
      DonorModel: this.#donorRepo.model,
      request
    });

    const matchedNames = matches.map(d => d.name).filter(Boolean);
    return { request, matches, matchedNames };
  }
}

/* ===================================
   Inheritance: RequestsController
   =================================== */
class RequestsController extends BaseController {
  #service;
  constructor() {
    super();
    this.#service = new RequestService();
    this.create = this.create.bind(this);
  }

  // POST /api/v1/requests
  async create(req, res) {
    try {
      const { patientName, bloodTypeNeeded, hospitalName, status } = req.body;

      // (Optional) quick inline validation; swap in Joi/Zod if you want:
      if (!patientName || !bloodTypeNeeded || !hospitalName) {
        return this.fail(res, 422, new Error('patientName, bloodTypeNeeded, hospitalName are required'));
      }

      const result = await this.#service.createAndMatch(
        { patientName, bloodTypeNeeded, hospitalName, status },
        { strategy: 'compatible' } // or 'exact'
      );

      // result contains { request, matches, matchedNames }
      return this.created(res, result);
    } catch (err) {
      return this.fail(res, 400, err);
    }
  }
}

/* ===============
   Route binding
   =============== */
const controller = new RequestsController();
router.post('/', controller.create);

module.exports = router;
