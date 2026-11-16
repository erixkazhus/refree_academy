package com.fibaref.academy.repository;

import com.fibaref.academy.dto.RulebookDtos.SignalMeta;
import com.fibaref.academy.model.RefereeSignal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RefereeSignalRepository extends JpaRepository<RefereeSignal, Integer> {

    @Query("SELECT new com.fibaref.academy.dto.RulebookDtos$SignalMeta(s.signalNumber, s.category, s.name, s.action) " +
            "FROM RefereeSignal s ORDER BY s.signalNumber ASC")
    List<SignalMeta> findAllMetaOrderBySignalNumber();

    @Query("SELECT s.signalNumber FROM RefereeSignal s")
    List<Integer> findAllSignalNumbers();
}
