package com.addexstores.service;

import com.addexstores.dto.response.DashboardOverviewResponse;
import com.addexstores.dto.response.DashboardResponse;

public interface DashboardService {

    DashboardResponse getDashboardStats();

    DashboardOverviewResponse getDashboardOverview();
}
