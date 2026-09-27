from datetime import datetime, timezone
from unittest.mock import Mock

import pytest

from app.services.budget_service import (
    get_current_month_cost,
    check_budget
)


def create_mock_db(cost):

    mock_db = Mock()

    mock_db.query.return_value.filter.return_value.scalar.return_value = (
        cost
    )

    return mock_db


def create_mock_api_key(
    api_key_id=1,
    monthly_budget_usd=5.0
):

    mock_api_key = Mock()

    mock_api_key.id = api_key_id
    mock_api_key.monthly_budget_usd = (
        monthly_budget_usd
    )

    return mock_api_key


def test_get_current_month_cost():

    mock_db = create_mock_db(3.25)

    result = get_current_month_cost(
        mock_db,
        1
    )

    assert result == 3.25


def test_get_current_month_cost_when_no_usage():

    mock_db = create_mock_db(None)

    result = get_current_month_cost(
        mock_db,
        1
    )

    assert result == 0.0


def test_check_budget_allows_when_under_budget():

    mock_db = create_mock_db(3.0)

    api_key = create_mock_api_key(
        monthly_budget_usd=5.0
    )

    result = check_budget(
        mock_db,
        api_key
    )

    assert result is None


def test_check_budget_blocks_when_budget_reached():

    mock_db = create_mock_db(5.0)

    api_key = create_mock_api_key(
        monthly_budget_usd=5.0
    )

    with pytest.raises(ValueError) as error:

        check_budget(
            mock_db,
            api_key
        )

    assert str(error.value) == (
        "Monthly AI budget exceeded"
    )


def test_check_budget_blocks_when_budget_exceeded():

    mock_db = create_mock_db(7.50)

    api_key = create_mock_api_key(
        monthly_budget_usd=5.0
    )

    with pytest.raises(ValueError) as error:

        check_budget(
            mock_db,
            api_key
        )

    assert str(error.value) == (
        "Monthly AI budget exceeded"
    )


def test_check_budget_allows_unlimited_key():

    mock_db = create_mock_db(100.0)

    api_key = create_mock_api_key(
        monthly_budget_usd=None
    )

    result = check_budget(
        mock_db,
        api_key
    )

    assert result is None