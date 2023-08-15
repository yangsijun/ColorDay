const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../index');
const testDb = require('./db');
const User = require('../models/user');
const Color = require('../models/color');
const jwt = require('jsonwebtoken');
const jwt_config = require('../config/jwtSecretKey.json');
const SECRET_KEY = jwt_config.SECRET_KEY;

describe('Color Management', () => {

    before(async () => {
        await testDb.connectTestDb();
    });

    after(async () => {
        await testDb.clearData();
        await testDb.disconnect();
        process.exit();
    });

    beforeEach(async () => {
        await testDb.clearData();
    });

    describe('GET /api/colors', () => {
        it('should retrieve colors for a user', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign({ id: user._id }, SECRET_KEY);

            const res = await request(app)
                .get('/api/colors')
                .set('Authorization', `Bearer ${token}`);

            const expectedColors = [
                {
                    userId: user._id.toString(),
                    date: '2023-08-13',
                    colorCode: '#32A852',
                    description: 'Today is green'
                },
                {
                    userId: user._id.toString(),
                    date: '2023-08-14',
                    colorCode: '#6A2694',
                    description: 'Today is purple'
                },
                {
                    userId: user._id.toString(),
                    date: '2023-08-15',
                    colorCode: '#82482E',
                    description: 'Today is Brown'
                }
            ];

            const receivedColors = res.body.map(color => ({
                userId: color.userId,
                date: color.date,
                colorCode: color.colorCode,
                description: color.description
            }));

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(receivedColors).to.deep.include.members(expectedColors);
        });

        it('should require a token for access', async () => {
            const res = await request(app)
                .get('/api/colors');
    
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('message').to.equal('No token provided');
        });

        it('should handle invalid token', async () => {
            const res = await request(app)
                .get('/api/colors')
                .set('Authorization', 'Bearer invalid_token');
        
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('message').to.equal('Failed to authenticate token');
        });
    });


    describe('POST /api/colors', () => {
        it('should create a new color record', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign({ id: user._id }, SECRET_KEY);

            const res = await request(app)
                .post('/api/colors')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    date: '2023-08-16',
                    colorCode: '#4286F4',
                    description: 'A cool blue color',
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('_id');
            expect(res.body.date).to.equal('2023-08-16');
            expect(res.body.colorCode).to.equal('#4286F4');
            expect(res.body.description).to.equal('A cool blue color');
        });

        it('should require a token for access', async () => {
            const res = await request(app)
                .post('/api/colors')
                .send({
                    date: '2023-08-16',
                    colorCode: '#4286F4',
                    description: 'A cool blue color',
                });
    
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('message').to.equal('No token provided');
        });
        
        it('should handle invalid token', async () => {
            const res = await request(app)
                .post('/api/colors')
                .set('Authorization', 'Bearer invalid_token')
                .send({
                    date: '2023-08-16',
                    colorCode: '#4286F4',
                    description: 'A cool blue color',
                });
        
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('message').to.equal('Failed to authenticate token');
        });

        it('should reject invalid date format', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign({ id: user._id }, SECRET_KEY);

            const res = await request(app)
                .get('/api/colors/range')
                .set('Authorization', `Bearer ${token}`)
                .query({ date: '2023/08/13' });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message').to.equal('Invalid date format');
        });
    });

    describe('PUT /api/colors', () => {
        it('should update an existing color record', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign({ id: user._id }, SECRET_KEY);
            
            const updatedColorRes = await request(app)
                .put('/api/colors/')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    date: '2023-08-15',
                    colorCode: '#00ff00',
                    description: 'An updated color',
                });
    
            expect(updatedColorRes.status).to.equal(200);
            expect(updatedColorRes.body).to.have.property('_id');
            expect(updatedColorRes.body.date).to.equal('2023-08-15');
            expect(updatedColorRes.body.colorCode).to.equal('#00ff00');
            expect(updatedColorRes.body.description).to.equal('An updated color');
        });

        it('should require a token for access', async () => {
            const res = await request(app)
                .put('/api/colors')
                .send({
                    date: '2023-08-15',
                    colorCode: '#00ff00',
                    description: 'An updated color',
                });
    
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('message').to.equal('No token provided');
        });

        it('should handle invalid token', async () => {
            const res = await request(app)
                .put('/api/colors')
                .set('Authorization', 'Bearer invalid_token')
                .send({
                    date: '2023-08-15',
                    colorCode: '#00ff00',
                    description: 'An updated color',
                });
        
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('message').to.equal('Failed to authenticate token');
        });

        it('should reject invalid date format', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign({ id: user._id }, SECRET_KEY);

            const res = await request(app)
                .get('/api/colors/range')
                .set('Authorization', `Bearer ${token}`)
                .query({ date: '2023/08/13' });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message').to.equal('Invalid date format');
        });
    });

    describe('DELETE /api/colors/', () => {
        it('should delete an existing color record', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign({ id: user._id }, SECRET_KEY);
    
            const deleteColorRes = await request(app)
                .delete('/api/colors/?date=2023-08-15')
                .set('Authorization', `Bearer ${token}`);
    
            expect(deleteColorRes.status).to.equal(200);
            expect(deleteColorRes.body.message).to.equal('Color deleted');
        });

        it('should require a token for access', async () => {
            const res = await request(app)
                .delete('/api/colors/?date=2023-08-15');
    
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('message').to.equal('No token provided');
        });

        it('should handle invalid token', async () => {
            const res = await request(app)
                .delete('/api/colors/?date=2023-08-15')
                .set('Authorization', 'Bearer invalid_token');
        
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('message').to.equal('Failed to authenticate token');
        });

        it('should reject invalid date format', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign({ id: user._id }, SECRET_KEY);

            const res = await request(app)
                .get('/api/colors/range')
                .set('Authorization', `Bearer ${token}`)
                .query({ date: '2023/08/13' });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message').to.equal('Invalid date format');
        });
    });

    describe('GET /api/colors/range', () => {
        it('should retrieve colors within a date range for a user', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign({ id: user._id }, SECRET_KEY);
    
            const res = await request(app)
                .get('/api/colors/range')
                .set('Authorization', `Bearer ${token}`)
                .query({ startDate: '2023-08-13', endDate: '2023-08-14' });
    
            const expectedColors = [
                {
                    userId: user._id.toString(),
                    date: '2023-08-13',
                    colorCode: '#32A852',
                    description: 'Today is green'
                },
                {
                    userId: user._id.toString(),
                    date: '2023-08-14',
                    colorCode: '#6A2694',
                    description: 'Today is purple'
                }
            ];

            const receivedColors = res.body.map(color => ({
                userId: color.userId,
                date: color.date,
                colorCode: color.colorCode,
                description: color.description
            }));

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(receivedColors).to.deep.include.members(expectedColors);
        });

        it('should require a token for access', async () => {
            const res = await request(app)
                .get('/api/colors/range')
                .query({ startDate: '2023-08-13', endDate: '2023-08-14' });
    
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('message').to.equal('No token provided');
        });

        it('should handle invalid token', async () => {
            const res = await request(app)
                .get('/api/colors/range')
                .set('Authorization', 'Bearer invalid_token')
                .query({ startDate: '2023-08-13', endDate: '2023-08-14' });
        
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('message').to.equal('Failed to authenticate token');
        });

        it('should reject invalid date format', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign({ id: user._id }, SECRET_KEY);

            const res = await request(app)
                .get('/api/colors/range')
                .set('Authorization', `Bearer ${token}`)
                .query({ startDate: '2023/08/13', endDate: '2023-08-15' });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message').to.equal('Invalid date format');
        });
    });
});
