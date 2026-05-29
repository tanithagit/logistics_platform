from tests.conftest import (
    create_org_and_admin, create_driver,
    create_customer, create_vehicle, create_delivery
)

class TestRoleBasedAccess:

    def test_customer_cannot_access_admin_routes(self, client):
        token = create_org_and_admin(client, "roles1")
        admin_headers = {"Authorization": f"Bearer {token}"}
        _, customer_headers = create_customer(
            client, admin_headers, "roles1"
        )
        response = client.get(
            "/users/drivers", headers=customer_headers
        )
        assert response.status_code == 403
        print("✅ Customer blocked from admin routes")

    def test_driver_cannot_access_admin_routes(self, client):
        token = create_org_and_admin(client, "roles2")
        admin_headers = {"Authorization": f"Bearer {token}"}
        _, driver_headers = create_driver(
            client, admin_headers, "roles2"
        )
        response = client.get(
            "/vehicles/", headers=driver_headers
        )
        assert response.status_code == 403
        print("✅ Driver blocked from admin routes")

    def test_admin_cannot_create_delivery(self, client):
        token = create_org_and_admin(client, "roles3")
        admin_headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/deliveries/", json={
            "pickup_address": "Test",
            "delivery_address": "Test"
        }, headers=admin_headers)
        assert response.status_code == 403
        print("✅ Admin blocked from customer-only routes")

    def test_driver_cannot_assign_delivery(self, client):
        token = create_org_and_admin(client, "roles4")
        admin_headers = {"Authorization": f"Bearer {token}"}
        driver_user, driver_headers = create_driver(
            client, admin_headers, "roles4"
        )
        _, customer_headers = create_customer(
            client, admin_headers, "roles4"
        )
        vehicle = create_vehicle(client, admin_headers, "ROLES4")
        delivery = create_delivery(client, customer_headers)

        response = client.put(
            f"/deliveries/{delivery['id']}/assign",
            json={
                "driver_id": driver_user["id"],
                "vehicle_id": vehicle["id"],
                "total_cost": 500
            },
            headers=driver_headers
        )
        assert response.status_code == 403
        print("✅ Driver blocked from assigning deliveries")

    def test_admin_can_manage_vehicles(self, client):
        token = create_org_and_admin(client, "roles5")
        admin_headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/vehicles/", headers=admin_headers)
        assert response.status_code == 200
        print("✅ Admin can access vehicle management")

    def test_customer_can_create_delivery(self, client):
        token = create_org_and_admin(client, "roles6")
        admin_headers = {"Authorization": f"Bearer {token}"}
        _, customer_headers = create_customer(
            client, admin_headers, "roles6"
        )
        response = client.post("/deliveries/", json={
            "pickup_address": "Role Test Pickup",
            "delivery_address": "Role Test Delivery"
        }, headers=customer_headers)
        assert response.status_code == 200
        print("✅ Customer can create deliveries")