package com.user.dto;

public class OrderItemRequest {
    private Long itemId;
    private Integer qty;
    public OrderItemRequest() {}
	public OrderItemRequest(Long itemId, Integer qty) {
		this.itemId = itemId;
		this.qty = qty;
	}
	public Long getItemId() {
		return itemId;
	}
	public void setItemId(Long itemId) {
		this.itemId = itemId;
	}
	public Integer getQty() {
		return qty;
	}
	public void setQty(Integer qty) {
		this.qty = qty;
	}

}
