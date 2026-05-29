from tests.conftest import (
    create_org_and_admin, create_driver,
    create_customer, create_vehicle, create_delivery
)

class TestDeliveryWorkflow:

    def test_customer_creates_delivery(self, client):
        token = create_org_and_admin(client, "del1")
        admin_headers = {"Authorization": f"Bearer {token}"}
        _, customer_headers = create_customer(
            client, admin_headers, "del1"
        )
        response = client.post("/deliveries/", json={
            "pickup_address": "Workflow Pickup",
            "delivery_address": "Workflow Delivery"
        }, headers=customer_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "pending"
        print("✅ Delivery starts as PENDING")

    def test_admin_assigns_delivery(self, client):
        token = create_org_and_admin(client, "del2")
        admin_headers = {"Authorization": f"Bearer {token}"}
        driver_user, _ = create_driver(client, admin_headers, "del2")
        _, customer_headers = create_customer(
            client, admin_headers, "del2"
        )
        vehicle = create_vehicle(client, admin_headers, "DEL2")
        delivery = create_delivery(client, customer_headers)

        response = client.put(
            f"/deliveries/{delivery['id']}/assign",
            json={
                "driver_id": driver_user["id"],
                "vehicle_id": vehicle["id"],
                "total_cost": 750
            },
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "assigned"
        assert data["total_cost"] == 750
        print("✅ Admin can assign driver and vehicle")

    def test_cannot_assign_unavailable_vehicle(self, client):
        token = create_org_and_admin(client, "del3")
        admin_headers = {"Authorization": f"Bearer {token}"}
        driver_user, _ = create_driver(client, admin_headers, "del3")
        _, customer_headers = create_customer(
            client, admin_headers, "del3"
        )
        vehicle = create_vehicle(client, admin_headers, "DEL3")
        delivery = create_delivery(client, customer_headers)

        # Set vehicle to maintenance
        client.put(
            f"/vehicles/{vehicle['id']}",
            json={"status": "maintenance"},
            headers=admin_headers
        )

        response = client.put(
            f"/deliveries/{delivery['id']}/assign",
            json={
                "driver_id": driver_user["id"],
                "vehicle_id": vehicle["id"],
                "total_cost": 500
            },
            headers=admin_headers
        )
        assert response.status_code == 400
        print("✅ Unavailable vehicle correctly rejected")

    def test_invalid_status_transition(self, client):
        token = create_org_and_admin(client, "del4")
        admin_headers = {"Authorization": f"Bearer {token}"}
        driver_user, driver_headers = create_driver(
            client, admin_headers, "del4"
        )
        _, customer_headers = create_customer(
            client, admin_headers, "del4"
        )
        vehicle = create_vehicle(client, admin_headers, "DEL4")
        delivery = create_delivery(client, customer_headers)

        client.put(
            f"/deliveries/{delivery['id']}/assign",
            json={
                "driver_id": driver_user["id"],
                "vehicle_id": vehicle["id"],
                "total_cost": 500
            },
            headers=admin_headers
        )

        # Try jumping from assigned to delivered
        response = client.put(
            f"/deliveries/{delivery['id']}/status",
            json={"status": "delivered"},
            headers=driver_headers
        )
        assert response.status_code == 400
        print("✅ Invalid status transition rejected")

    def test_driver_cannot_update_others_delivery(self, client):
        token = create_org_and_admin(client, "del5")
        admin_headers = {"Authorization": f"Bearer {token}"}
        driver_user, driver_headers = create_driver(
            client, admin_headers, "del5a"
        )
        other_driver, _ = create_driver(
            client, admin_headers, "del5b"
        )
        _, customer_headers = create_customer(
            client, admin_headers, "del5"
        )
        vehicle = create_vehicle(client, admin_headers, "DEL5")
        delivery = create_delivery(client, customer_headers)

        # Assign to OTHER driver
        client.put(
            f"/deliveries/{delivery['id']}/assign",
            json={
                "driver_id": other_driver["id"],
                "vehicle_id": vehicle["id"],
                "total_cost": 500
            },
            headers=admin_headers
        )

        # Try update with wrong driver
        response = client.put(
            f"/deliveries/{delivery['id']}/status",
            json={"status": "picked_up"},
            headers=driver_headers
        )
        assert response.status_code == 403
        print("✅ Driver blocked from others delivery")

    def test_full_delivery_lifecycle(self, client):
        token = create_org_and_admin(client, "del6")
        admin_headers = {"Authorization": f"Bearer {token}"}
        driver_user, driver_headers = create_driver(
            client, admin_headers, "del6"
        )
        _, customer_headers = create_customer(
            client, admin_headers, "del6"
        )
        vehicle = create_vehicle(client, admin_headers, "DEL6")

        # Step 1: Create
        delivery = create_delivery(client, customer_headers)
        assert delivery["status"] == "pending"

        # Step 2: Assign
        assigned = client.put(
            f"/deliveries/{delivery['id']}/assign",
            json={
                "driver_id": driver_user["id"],
                "vehicle_id": vehicle["id"],
                "total_cost": 600
            },
            headers=admin_headers
        ).json()
        assert assigned["status"] == "assigned"

        # Step 3: Pick up
        picked = client.put(
            f"/deliveries/{delivery['id']}/status",
            json={"status": "picked_up"},
            headers=driver_headers
        ).json()
        assert picked["status"] == "picked_up"

        # Step 4: In transit
        transit = client.put(
            f"/deliveries/{delivery['id']}/status",
            json={"status": "in_transit"},
            headers=driver_headers
        ).json()
        assert transit["status"] == "in_transit"

        # Step 5: Delivered
        delivered = client.put(
            f"/deliveries/{delivery['id']}/status",
            json={"status": "delivered"},
            headers=driver_headers
        ).json()
        assert delivered["status"] == "delivered"
        print("✅ Full lifecycle: pending→assigned→picked_up→in_transit→delivered")