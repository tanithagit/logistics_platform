from tests.conftest import create_org_and_admin

class TestAuthentication:

    def test_register_organization(self, client):
        response = client.post("/auth/register", json={
            "org_name": "Auth Test Org",
            "org_email": "authtest@test.com",
            "org_phone": "1111111111",
            "org_address": "Auth City",
            "full_name": "Auth Admin",
            "email": "authadmin@test.com",
            "password": "auth123",
            "phone": "1111111111"
        })
        assert response.status_code == 200
        data = response.json()
        assert "org_id" in data
        print("✅ Organization registration works")

    def test_login_success(self, client):
        create_org_and_admin(client, suffix="login")
        response = client.post("/auth/login", json={
            "email": "adminlogin@test.com",
            "password": "test123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        print("✅ Login works and returns token")

    def test_login_wrong_password(self, client):
        create_org_and_admin(client, suffix="wrongpw")
        response = client.post("/auth/login", json={
            "email": "adminwrongpw@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✅ Wrong password correctly rejected")

    def test_login_wrong_email(self, client):
        response = client.post("/auth/login", json={
            "email": "nobody@test.com",
            "password": "test123"
        })
        assert response.status_code == 401
        print("✅ Non-existent email correctly rejected")

    def test_get_profile_authenticated(self, client):
        token = create_org_and_admin(client, suffix="profile")
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 200
        assert response.json()["role"] == "admin"
        print("✅ Authenticated profile fetch works")

    def test_get_profile_no_token(self, client):
        response = client.get("/auth/me")
        assert response.status_code == 401
        print("✅ Unauthenticated request correctly rejected")