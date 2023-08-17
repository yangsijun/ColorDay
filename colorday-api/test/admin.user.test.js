const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../index');
const testDb = require('./db');
const User = require('../models/user');
const Admin = require('../models/admin');
const TEST_ADMIN_TOKEN = require('../config/adminConfig.json').TEST_ADMIN_TOKEN;

describe('Authentication', () => {

    before(async () => {
        await testDb.connectTestDb();
    });

    after(async () => {
        await testDb.clearData();
        await testDb.disconnect();
        // process.exit();
    });

    beforeEach(async () => {
        await testDb.clearData();
    });
    
    let createdUserId;

    // describe('POST /api/admin/newAdmin', () => {
    //     it('should create a new admin', async () => {
    //         const res = await request(app)
    //             .post('/api/admin/newAdmin')
    //             .send({
    //                 adminname: 'admin',
    //                 password: "ilovehanhee"
    //             });
            
    //         console.log(res.body);
    //     });
    // });

    describe('GET /api/admin/users', () => {
        it('should get all users', async () => {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`);
            
            const expectedUsers = [
                {
                    username: 'testuser',
                    email: 'testuser@example.com'
                },
                {
                    username: 'testuser2',
                    email: 'testuser2@example.com'
                }
            ];
            
            const receivedUsers = res.body.map(user => ({
                username: user.username,
                email: user.email
            }));
            
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(receivedUsers).to.deep.include.members(expectedUsers);
        });
    });

    describe('POST /api/admin/users', () => {
        it('should create a new user', async () => {
            const res = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`)
                .send({
                    username: 'testnewuser',
                    email: 'testnewuser@example.com',
                    password: 'testpassword'
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('_id');
            createdUserId = res.body._id;
        });
    });

    describe('GET /api/admin/users/:id', () => {
        it('should get user by ID', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const userId = user._id;
            const res = await request(app)
                .get(`/api/admin/users/${userId}`)
                .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`);

            const expectedUser = {
                username: 'testuser',
                email: 'testuser@example.com'
            };

            const receivedUser = {
                username: res.body.username,
                email: res.body.email
            };

            expect(res.status).to.equal(200);
            expect(receivedUser).to.deep.equal(expectedUser);
        });
    });

    describe('PUT /api/admin/users/:id', () => {
        it('should update user', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const userId = user._id;
            const res = await request(app)
                .put(`/api/admin/users/${userId}`)
                .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`)
                .send({
                    username: 'updateduser',
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('username').to.equal('updateduser');
        });
    });

    describe('DELETE /api/admin/users/:id', () => {
        it('should delete a user by id', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const userId = user._id;
            const res = await request(app)
                .delete(`/api/admin/users/${userId}`)
                .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message').to.equal('User deleted');
        
            const deletedUser = await User.findById(userId);
            expect(deletedUser).to.be.null;
        });
    });

    describe('PUT /api/admin/users/:id/change-password', () => {
        it('should change password of a user by id', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const userId = user._id;            
            const res = await request(app)
                .put(`/api/admin/users/${userId}/change-password`)
                .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`)
                .send({
                    currentPassword: 'testpassword',
                    newPassword: 'newtestpassword'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message').to.equal('Password changed successfully');
        });
    });
});