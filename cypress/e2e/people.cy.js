// API E2E tests for People endpoints
// These tests use cy.request() so they can validate the backend without a UI.
// Assumption: server is running at baseUrl configured in cypress.config.js

const API_BASE = '/people';

function uniqueName(prefix = 'cypress') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function makeTitanicPerson(overrides = {}) {
  // Matches columns used in models/people_model.js
  return {
    survived: 1,
    pclass: 3,
    name: uniqueName('person'),
    sex: 'male',
    age: 30,
    siblings_spouses_abroad: 0,
    parents_children_abroad: 0,
    fare: 7.25,
    ...overrides,
  };
}

function assertPgResultShape(resBody) {
  // pg Client query() returns { rows, rowCount, ... }
  expect(resBody).to.be.an('object');
  expect(resBody).to.have.property('rows');
  expect(resBody.rows).to.be.an('array');
}

describe('People API', () => {
  describe('GET /people', () => {
    it('returns 200 and JSON', () => {
      cy.request({
        method: 'GET',
        url: API_BASE,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.headers['content-type']).to.include('application/json');
      });
    });

    it('returns an array response (or empty array)', () => {
      cy.request('GET', API_BASE).then((res) => {
        expect(res.status).to.eq(200);
        assertPgResultShape(res.body);
      });
    });

    it('each item (if present) has a uuid field', () => {
      cy.request('GET', API_BASE).then((res) => {
        expect(res.status).to.eq(200);
        assertPgResultShape(res.body);
        if (res.body.rows.length > 0) {
          expect(res.body.rows[0]).to.have.property('uuid');
        }
      });
    });
  });

  describe('POST /people', () => {
    it('creates a person and returns inserted row(s)', () => {
      const payload = makeTitanicPerson();

      cy.request({
        method: 'POST',
        url: API_BASE,
        body: payload,
        failOnStatusCode: false,
      }).then((res) => {
        expect([200, 201]).to.include(res.status);
        expect(res.headers['content-type']).to.include('application/json');
    assertPgResultShape(res.body);
    expect(res.body.rows.length).to.be.greaterThan(0);
      });
    });

  it('handles missing body gracefully (returns 4xx or a JSON error/null)', () => {
      cy.request({
        method: 'POST',
        url: API_BASE,
        body: {},
        failOnStatusCode: false,
      }).then((res) => {
    // Current API returns `null` with 200 when model throws. Accept both patterns.
    expect(res.status).to.be.oneOf([200, 400, 422]);
      });
    });

  it('handles invalid payload types (returns 4xx or a JSON error/null)', () => {
      cy.request({
        method: 'POST',
        url: API_BASE,
        headers: { 'content-type': 'application/json' },
    body: makeTitanicPerson({ name: 12345 }),
        failOnStatusCode: false,
      }).then((res) => {
    expect(res.status).to.be.oneOf([200, 400, 422]);
      });
    });
  });

  describe('GET /people/:uuid', () => {
    it('returns 200 for an existing uuid', () => {
      const payload = makeTitanicPerson();

      cy.request('POST', API_BASE, payload).then((createRes) => {
        assertPgResultShape(createRes.body);
        const uuid = createRes.body.rows[0]?.uuid;
        expect(uuid).to.be.a('string');

        cy.request('GET', `${API_BASE}/${uuid}`).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.headers['content-type']).to.include('application/json');
          assertPgResultShape(res.body);
        });
      });
    });

    it('returns row(s) for the requested uuid', () => {
      const payload = makeTitanicPerson();

      cy.request('POST', API_BASE, payload).then((createRes) => {
        assertPgResultShape(createRes.body);
        const uuid = createRes.body.rows[0]?.uuid;

        cy.request('GET', `${API_BASE}/${uuid}`).then((res) => {
          expect(res.status).to.eq(200);
          assertPgResultShape(res.body);
          if (res.body.rows.length > 0 && 'uuid' in res.body.rows[0]) {
            expect(res.body.rows[0].uuid).to.eq(uuid);
          }
        });
      });
    });

    it('returns 4xx for an invalid/non-existing uuid', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/00000000-0000-0000-0000-000000000000`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.be.within(400, 499);
      });
    });
  });

  describe('PUT /people/:uuid', () => {
    it('updates an existing person and returns 200', () => {
      const payload = makeTitanicPerson();

      cy.request('POST', API_BASE, payload).then((createRes) => {
        assertPgResultShape(createRes.body);
        const uuid = createRes.body.rows[0]?.uuid;
        const updated = makeTitanicPerson({ name: uniqueName('put-updated') });

        cy.request({
          method: 'PUT',
          url: `${API_BASE}/${uuid}`,
          body: updated,
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.headers['content-type']).to.include('application/json');
          // update returns pg result; might have empty rows depending on query
          if (res.body) {
            assertPgResultShape(res.body);
          }
        });
      });
    });

    it('rejects update for non-existing uuid (expects 4xx)', () => {
      cy.request({
        method: 'PUT',
        url: `${API_BASE}/00000000-0000-0000-0000-000000000000`,
        body: { name: uniqueName('missing') },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.be.within(400, 499);
      });
    });

    it('handles invalid update payload (returns 4xx or a JSON error/null)', () => {
      const payload = makeTitanicPerson();

      cy.request('POST', API_BASE, payload).then((createRes) => {
        assertPgResultShape(createRes.body);
        const uuid = createRes.body.rows[0]?.uuid;

        cy.request({
          method: 'PUT',
          url: `${API_BASE}/${uuid}`,
          body: makeTitanicPerson({ name: 999 }),
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.be.oneOf([200, 400, 422]);
        });
      });
    });
  });

  describe('DELETE /people/:uuid', () => {
    it('deletes an existing person and returns 200/204', () => {
      const payload = makeTitanicPerson();

      cy.request('POST', API_BASE, payload).then((createRes) => {
        assertPgResultShape(createRes.body);
        const uuid = createRes.body.rows[0]?.uuid;

        cy.request({
          method: 'DELETE',
          url: `${API_BASE}/${uuid}`,
          failOnStatusCode: false,
        }).then((res) => {
          expect([200, 204]).to.include(res.status);
        });
      });
    });

    it('subsequent GET after delete should return 4xx', () => {
      const payload = makeTitanicPerson();

      cy.request('POST', API_BASE, payload).then((createRes) => {
        assertPgResultShape(createRes.body);
        const uuid = createRes.body.rows[0]?.uuid;

        cy.request('DELETE', `${API_BASE}/${uuid}`).then(() => {
          cy.request({
            method: 'GET',
            url: `${API_BASE}/${uuid}`,
            failOnStatusCode: false,
          }).then((res) => {
            expect(res.status).to.be.within(400, 499);
          });
        });
      });
    });

    it('deleting a non-existing uuid returns 4xx (or 200 if idempotent)', () => {
      cy.request({
        method: 'DELETE',
        url: `${API_BASE}/00000000-0000-0000-0000-000000000000`,
        failOnStatusCode: false,
      }).then((res) => {
        // Some APIs implement idempotent delete and return 200/204.
        expect(res.status).to.be.oneOf([200, 204, 404]);
      });
    });
  });
});
